import { NextRequest, NextResponse } from 'next/server';

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

    // For demo purposes, return mock data
    // In production, this would use the actual B2B GraphQL API
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
      {
        id: '4',
        orderNumber: 'ORD-2024-004',
        status: 'shipped',
        customer: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          company: 'Acme Corp',
        },
        totalAmount: {
          amount: 3200.00,
          currencyCode: 'USD',
        },
        createdAt: '2024-01-25T14:20:00Z',
        updatedAt: '2024-01-26T09:30:00Z',
        lineItems: {
          edges: [
            {
              node: {
                id: '4',
                productId: '104',
                productName: 'Deluxe Widget D',
                quantity: 4,
                unitPrice: {
                  amount: 800.00,
                  currencyCode: 'USD',
                },
              },
            },
          ],
        },
      },
      {
        id: '5',
        orderNumber: 'ORD-2024-005',
        status: 'cancelled',
        customer: {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          company: 'Enterprise Inc',
        },
        totalAmount: {
          amount: 1500.00,
          currencyCode: 'USD',
        },
        createdAt: '2024-01-28T16:45:00Z',
        updatedAt: '2024-01-29T10:15:00Z',
        lineItems: {
          edges: [
            {
              node: {
                id: '5',
                productId: '105',
                productName: 'Basic Widget E',
                quantity: 15,
                unitPrice: {
                  amount: 100.00,
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