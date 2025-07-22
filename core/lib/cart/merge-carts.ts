'use server';

import { cookies } from 'next/headers';

import { addCartLineItem, assertAddCartLineItemErrors } from '~/client/mutations/add-cart-line-item';
import { getCart } from '~/client/queries/get-cart';
import { TAGS } from '~/client/tags';
import { unstable_expireTag } from 'next/cache';
import { backupCartItems, getBackupCartItems, clearCartBackup } from './backup-cart';

/**
 * Merges items from an existing cart into a new B2B cart
 * This prevents losing existing cart items when B2B creates a new cart
 */
export async function mergeCarts(existingCartId: string, newB2BCartId: string): Promise<boolean> {
  try {
    console.log('🔄 Starting cart merge process...');
    console.log('Existing cart ID:', existingCartId);
    console.log('New B2B cart ID:', newB2BCartId);

    // Get the existing cart first to check if it has items
    const existingCart = await getCart(existingCartId);
    if (!existingCart?.lineItems?.physicalItems || existingCart.lineItems.physicalItems.length === 0) {
      console.log('No existing cart items to merge');
      return true;
    }

    console.log(`Found ${existingCart.lineItems.physicalItems.length} items in existing cart`);

    // Create a backup of the existing cart before merging
    await backupCartItems(existingCartId);

    // Get the new B2B cart to see what's already in it
    const newB2BCart = await getCart(newB2BCartId);
    const newCartItems = newB2BCart?.lineItems?.physicalItems || [];
    console.log(`New B2B cart has ${newCartItems.length} items`);

    // If the new cart already has items, we might not need to merge
    if (newCartItems.length > 0) {
      console.log('⚠️ New B2B cart already has items - checking if merge is needed');
      
      // Check if the new cart already contains the items we want to merge
      const existingProductIds = new Set(existingCart.lineItems.physicalItems.map(item => item.productEntityId));
      const newProductIds = new Set(newCartItems.map(item => item.productEntityId));
      
      const missingProducts = existingCart.lineItems.physicalItems.filter(item => !newProductIds.has(item.productEntityId));
      
      if (missingProducts.length === 0) {
        console.log('✅ All existing items are already in the new cart - no merge needed');
        await clearCartBackup();
        return true;
      }
      
      console.log(`🔄 Need to merge ${missingProducts.length} missing items`);
    }

    // Prepare line items for the new cart
    const lineItems = existingCart.lineItems.physicalItems.map((item) => ({
      productEntityId: item.productEntityId,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions || [],
    }));

    // Add all items from the existing cart to the new B2B cart
    const addCartLineItemResponse = await addCartLineItem(newB2BCartId, {
      lineItems,
    });

    assertAddCartLineItemErrors(addCartLineItemResponse);

    console.log('✅ Successfully merged cart items');
    
    // Clear the backup since merge was successful
    await clearCartBackup();
    
    // Expire cart cache to ensure fresh data
    unstable_expireTag(TAGS.cart);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to merge carts:', error);
    
    // Try to restore from backup if merge failed
    const backup = await getBackupCartItems();
    if (backup) {
      console.log('🔄 Attempting to restore cart from backup...');
      try {
        // Add backup items to the new cart
        const addCartLineItemResponse = await addCartLineItem(newB2BCartId, {
          lineItems: backup.items,
        });
        assertAddCartLineItemErrors(addCartLineItemResponse);
        console.log('✅ Successfully restored cart from backup');
        await clearCartBackup();
        return true;
      } catch (restoreError) {
        console.error('❌ Failed to restore from backup:', restoreError);
      }
    }
    
    return false;
  }
}

/**
 * Handles B2B cart creation by merging existing cart items
 */
export async function handleB2BCartCreated(newB2BCartId: string): Promise<void> {
  const cookieStore = await cookies();
  const existingCartId = cookieStore.get('cartId')?.value;

  console.log('🔄 B2B Cart Created Event:', {
    newB2BCartId,
    existingCartId,
    hasExistingCart: !!existingCartId,
    isSameCart: existingCartId === newB2BCartId
  });

  if (!existingCartId) {
    // No existing cart, just set the new cart ID
    console.log('📝 No existing cart - setting new B2B cart ID');
    cookieStore.set({
      name: 'cartId',
      value: newB2BCartId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
    return;
  }

  if (existingCartId === newB2BCartId) {
    // Same cart ID, no need to merge
    console.log('📝 Same cart ID - no merge needed');
    return;
  }

  console.log('🔄 B2B Cart Created - Checking if merge is needed...');
  
  // Attempt to merge the carts
  const mergeSuccess = await mergeCarts(existingCartId, newB2BCartId);
  
  if (mergeSuccess) {
    console.log('✅ Cart merge successful - updating cookie');
    // Update the cookie to the new cart ID
    cookieStore.set({
      name: 'cartId',
      value: newB2BCartId,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  } else {
    console.warn('⚠️ Cart merge failed - keeping existing cart');
    // If merge fails, keep the existing cart to prevent data loss
    // The backup will be available for manual recovery if needed
  }
} 