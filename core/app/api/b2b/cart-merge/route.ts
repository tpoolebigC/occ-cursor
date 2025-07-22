import { NextRequest, NextResponse } from 'next/server';

import { handleB2BCartCreated } from '~/lib/cart/merge-carts';

export async function POST(request: NextRequest) {
  try {
    const { newCartId } = await request.json();

    if (!newCartId) {
      return NextResponse.json(
        { error: 'Missing newCartId parameter' },
        { status: 400 }
      );
    }

    console.log('🔄 API: Handling B2B cart merge for cart ID:', newCartId);

    // Use the same cart merging logic
    await handleB2BCartCreated(newCartId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ API: Failed to merge B2B cart:', error);
    return NextResponse.json(
      { error: 'Failed to merge cart' },
      { status: 500 }
    );
  }
} 