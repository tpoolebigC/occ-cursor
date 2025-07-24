import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const GetB2BStatsQuery = graphql(`
  query getB2BStats($customerId: Int!) {
    customer(id: $customerId) {
      id
      orders {
        edges {
          node {
            id
            status
            total {
              value
              currencyCode
            }
            createdAt {
              utc
            }
          }
        }
      }
      quotes {
        edges {
          node {
            id
            status
            total {
              value
              currencyCode
            }
            createdAt {
              utc
            }
          }
        }
      }
    }
    site {
      products {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`);

export async function GET(request: NextRequest) {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    
    if (!customerAccessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, use a default customer ID
    // In a real implementation, you'd get this from the session or request
    const customerId = 1;

    const { data } = await client.query({
      query: GetB2BStatsQuery,
      variables: { customerId },
    });

    if (!data?.customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate stats from the data
    const orders = data.customer.orders?.edges || [];
    const quotes = data.customer.quotes?.edges || [];
    const products = data.site?.products?.edges || [];

    // Filter active orders (not completed/cancelled)
    const activeOrders = orders.filter(({ node }) => 
      node.status !== 'COMPLETED' && node.status !== 'CANCELLED'
    );

    // Filter pending quotes
    const pendingQuotes = quotes.filter(({ node }) => 
      node.status === 'PENDING' || node.status === 'DRAFT'
    );

    // Calculate monthly revenue (orders from current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyOrders = orders.filter(({ node }) => {
      const orderDate = new Date(node.createdAt.utc);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyOrders.reduce((total, { node }) => {
      return total + parseFloat(node.total.value);
    }, 0);

    const stats = {
      activeOrders: activeOrders.length,
      monthlyRevenue: `$${monthlyRevenue.toLocaleString()}`,
      pendingQuotes: pendingQuotes.length,
      totalProducts: products.length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching B2B stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 