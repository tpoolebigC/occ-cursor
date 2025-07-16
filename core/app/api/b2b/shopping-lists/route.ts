import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/auth';
import { b2bClient } from '~/lib/b2b/client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.b2bToken) {
      return NextResponse.json(
        { error: 'B2B authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, isDefault, items } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'List name is required' },
        { status: 400 }
      );
    }

    // Set the B2B token for API calls
    b2bClient.setCustomerToken(session.b2bToken);

    // Create the shopping list using B2B API
    const shoppingList = await b2bClient.createShoppingList({
      name: name.trim(),
      description: description?.trim(),
      isDefault: isDefault || false,
    });

    // Add items to the list if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await b2bClient.addItemToShoppingList(shoppingList.id, {
          productId: item.productId,
          quantity: item.quantity,
          options: item.options || [],
        });
      }
    }

    return NextResponse.json({ success: true, shoppingList });
  } catch (error) {
    console.error('Error creating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to create shopping list' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.b2bToken) {
      return NextResponse.json(
        { error: 'B2B authentication required' },
        { status: 401 }
      );
    }

    // Set the B2B token for API calls
    b2bClient.setCustomerToken(session.b2bToken);

    // Get all shopping lists
    const shoppingLists = await b2bClient.getShoppingLists();

    return NextResponse.json({ shoppingLists });
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shopping lists' },
      { status: 500 }
    );
  }
} 