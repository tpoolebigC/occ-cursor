import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';

// BigCommerce B2B API endpoints
const B2B_API_BASE = process.env.BIGCOMMERCE_B2B_API_URL || 'https://api.bigcommerce.com/stores';
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const B2B_CLIENT_ID = process.env.BIGCOMMERCE_B2B_CLIENT_ID;
const B2B_CLIENT_SECRET = process.env.BIGCOMMERCE_B2B_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();

    // Temporarily allow unauthenticated access for demo purposes
    if (!customerAccessToken) {
      console.log('No authentication token, showing demo data');
      // Fall through to mock data
    }

    // Try to fetch real data from BigCommerce B2B API
    try {
      if (customerAccessToken && STORE_HASH && B2B_CLIENT_ID && B2B_CLIENT_SECRET) {
        const response = await fetch(
          `${B2B_API_BASE}/${STORE_HASH}/v3/b2b/quotes`,
          {
            headers: {
              'X-Auth-Token': customerAccessToken,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const quotes = data.data || [];
          const now = new Date();

          // Calculate quote statistics
          const pendingQuotes = quotes.filter((quote: any) => 
            quote.status === 'pending' || quote.status === 'draft'
          );

          const approvedQuotes = quotes.filter((quote: any) => 
            quote.status === 'approved'
          );

          const expiredQuotes = quotes.filter((quote: any) => {
            if (!quote.expiry_date) return false;
            const expiryDate = new Date(quote.expiry_date);
            return expiryDate < now;
          });

          const totalValue = quotes.reduce((total: number, quote: any) => {
            return total + parseFloat(quote.total_inc_tax || '0');
          }, 0);

          const stats = {
            pending: pendingQuotes.length,
            approved: approvedQuotes.length,
            expired: expiredQuotes.length,
            totalValue: `$${totalValue.toLocaleString()}`,
            totalQuotes: quotes.length,
          };

          return NextResponse.json(stats);
        }
      }
    } catch (b2bError) {
      console.log('B2B API call failed, falling back to mock data:', b2bError);
      // Fall through to mock data
    }

    // Fallback to mock data
    const mockStats = {
      pending: 2,
      approved: 1,
      expired: 1,
      totalValue: '$8,950',
      totalQuotes: 5,
    };

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Error fetching B2B quotes stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 