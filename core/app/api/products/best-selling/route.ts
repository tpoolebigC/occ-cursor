import { NextRequest, NextResponse } from 'next/server';

import { serverClient as client } from '~/client/server-client';
import { getBestSellingProducts } from '~/client/queries/get-products';

export async function GET(request: NextRequest) {
  try {
    const productData = await getBestSellingProducts();
    
    if (productData.status === 'success') {
      return NextResponse.json(productData);
    } else {
      return NextResponse.json(
        { error: productData.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching best-selling products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch best-selling products' },
      { status: 500 }
    );
  }
} 