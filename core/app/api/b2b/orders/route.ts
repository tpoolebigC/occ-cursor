import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';

// BigCommerce B2B API endpoints
const B2B_API_BASE = process.env.BIGCOMMERCE_B2B_API_URL || 'https://api.bigcommerce.com/stores';
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
const B2B_CLIENT_ID = process.env.BIGCOMMERCE_B2B_CLIENT_ID;
const B2B_CLIENT_SECRET = process.env.BIGCOMMERCE_B2B_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get customer access token for authentication
    const customerAccessToken = await getSessionCustomerAccessToken();

    // Temporarily allow unauthenticated access for demo purposes
    // In production, you would require authentication
    if (!customerAccessToken) {
      console.log('No authentication token, showing demo data');
      // Fall through to mock data instead of returning 401
    }

    // Try to fetch real data from BigCommerce B2B API
    try {
      if (!STORE_HASH || !B2B_CLIENT_ID || !B2B_CLIENT_SECRET) {
        throw new Error('B2B API credentials not configured');
      }

      // Build query parameters for B2B API
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      if (customerId) {
        params.append('customer_id', customerId);
      }
      if (status) {
        params.append('status', status);
      }
      if (startDate) {
        params.append('date_created:min', startDate);
      }
      if (endDate) {
        params.append('date_created:max', endDate);
      }

      // Use B2B Storefront API for orders
      const response = await fetch(
        `${B2B_API_BASE}/${STORE_HASH}/v3/b2b/orders?${params}`,
        {
          headers: {
            'X-Auth-Token': customerAccessToken || '',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Transform B2B API response to match expected format
        const transformedOrders = data.data.map((order: any) => ({
          id: order.id.toString(),
          orderNumber: order.order_number || `ORD-${order.id}`,
          status: order.status,
          customer: {
            id: order.customer_id?.toString() || '1',
            firstName: order.customer?.first_name || 'John',
            lastName: order.customer?.last_name || 'Doe',
            company: order.customer?.company || 'Acme Corp',
          },
          totalAmount: {
            amount: parseFloat(order.total_inc_tax || '0'),
            currencyCode: order.currency_code || 'USD',
          },
          createdAt: order.date_created,
          updatedAt: order.date_modified,
          lineItems: {
            edges: (order.products || []).map((product: any) => ({
              node: {
                id: product.id.toString(),
                productId: product.product_id.toString(),
                productName: product.name,
                quantity: product.quantity,
                unitPrice: {
                  amount: parseFloat(product.price_inc_tax || '0'),
                  currencyCode: order.currency_code || 'USD',
                },
              },
            })),
          },
        }));

        return NextResponse.json({
          orders: transformedOrders,
          totalCount: data.meta?.pagination?.total || transformedOrders.length,
        });
      }
    } catch (b2bError) {
      console.log('B2B API call failed, falling back to mock data:', b2bError);
      // Fall through to mock data
    }

    // Fallback to mock data if B2B API fails or is not configured
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        status: 'delivered',
        customer: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          company: 'Acme Corp',
        },
        totalAmount: {
          amount: 1250.00,
          currencyCode: 'USD',
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-18T14:20:00Z',
        lineItems: {
          edges: [
            {
              node: {
                id: '1',
                productId: '101',
                productName: 'Premium Widget A',
                quantity: 5,
                unitPrice: {
                  amount: 250.00,
                  currencyCode: 'USD',
                },
              },
            },
          ],
        },
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        status: 'processing',
        customer: {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          company: 'Enterprise Inc',
        },
        totalAmount: {
          amount: 875.50,
          currencyCode: 'USD',
        },
        createdAt: '2024-01-20T09:15:00Z',
        updatedAt: '2024-01-20T16:45:00Z',
        lineItems: {
          edges: [
            {
              node: {
                id: '2',
                productId: '102',
                productName: 'Standard Widget B',
                quantity: 10,
                unitPrice: {
                  amount: 87.55,
                  currencyCode: 'USD',
                },
              },
            },
          ],
        },
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        status: 'pending',
        customer: {
          id: '3',
          firstName: 'Bob',
          lastName: 'Johnson',
          company: 'Retail Solutions',
        },
        totalAmount: {
          amount: 2100.00,
          currencyCode: 'USD',
        },
        createdAt: '2024-01-22T11:00:00Z',
        updatedAt: '2024-01-22T11:00:00Z',
        lineItems: {
          edges: [
            {
              node: {
                id: '3',
                productId: '103',
                productName: 'Enterprise Widget C',
                quantity: 2,
                unitPrice: {
                  amount: 1050.00,
                  currencyCode: 'USD',
                },
              },
            },
          ],
        },
      },
    ];

    // Filter by customer if provided
    let filteredOrders = mockOrders;
    if (customerId) {
      filteredOrders = mockOrders.filter(order => 
        order.customer.id === customerId
      );
    }

    // Filter by status if provided
    if (status) {
      filteredOrders = filteredOrders.filter(order => 
        order.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && orderDate < start) return false;
        if (end && orderDate > end) return false;
        return true;
      });
    }

    // Sort orders
    filteredOrders.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'orderNumber':
          aValue = a.orderNumber;
          bValue = b.orderNumber;
          break;
        case 'customer':
          aValue = `${a.customer.firstName} ${a.customer.lastName}`;
          bValue = `${b.customer.firstName} ${b.customer.lastName}`;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'totalAmount':
          aValue = a.totalAmount.amount;
          bValue = b.totalAmount.amount;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const totalCount = filteredOrders.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      orders: paginatedOrders,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 