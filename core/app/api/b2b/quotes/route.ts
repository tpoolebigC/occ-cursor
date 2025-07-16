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
    const { items, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Set the B2B token for API calls
    b2bClient.setCustomerToken(session.b2bToken);

    // Create the quote using B2B API
    const quote = await b2bClient.createQuote({
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        options: item.options || [],
      })),
      notes: notes || '',
    });

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
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

    // Get all quotes
    const quotes = await b2bClient.getQuotes();

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
} 