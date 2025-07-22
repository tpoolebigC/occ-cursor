'use server';

import { cookies } from 'next/headers';

import { getCart } from '~/client/queries/get-cart';

/**
 * Stores cart items as a backup in case of merge failures
 */
export async function backupCartItems(cartId: string): Promise<void> {
  try {
    const cart = await getCart(cartId);
    if (!cart?.lineItems?.physicalItems) {
      return;
    }

    const backupData = {
      cartId,
      items: cart.lineItems.physicalItems.map((item) => ({
        productEntityId: item.productEntityId,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || [],
      })),
      timestamp: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'cartBackup',
      value: JSON.stringify(backupData),
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 3600, // 1 hour backup
    });

    console.log('💾 Cart backup created for cart ID:', cartId);
  } catch (error) {
    console.error('Failed to backup cart:', error);
  }
}

/**
 * Retrieves backed up cart items
 */
export async function getBackupCartItems(): Promise<{
  cartId: string;
  items: Array<{
    productEntityId: number;
    quantity: number;
    selectedOptions: any[];
  }>;
  timestamp: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const backupCookie = cookieStore.get('cartBackup');
    
    if (!backupCookie?.value) {
      return null;
    }

    const backupData = JSON.parse(backupCookie.value);
    
    // Check if backup is still valid (within 1 hour)
    const backupTime = new Date(backupData.timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - backupTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff > 1) {
      // Backup is expired, remove it
      cookieStore.delete('cartBackup');
      return null;
    }

    return backupData;
  } catch (error) {
    console.error('Failed to retrieve cart backup:', error);
    return null;
  }
}

/**
 * Clears the cart backup
 */
export async function clearCartBackup(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('cartBackup');
    console.log('🗑️ Cart backup cleared');
  } catch (error) {
    console.error('Failed to clear cart backup:', error);
  }
} 