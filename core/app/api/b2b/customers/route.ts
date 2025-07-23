import { NextRequest, NextResponse } from 'next/server';
import { b2bClient } from '~/lib/b2b/client';
import { GET_CUSTOMERS } from '~/lib/b2b/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // For demo purposes, return mock data
    // In production, this would use the actual B2B GraphQL API
    const mockCustomers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        company: 'Acme Corp',
        customerGroup: {
          id: '1',
          name: 'Wholesale',
        },
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@enterprise.com',
        company: 'Enterprise Inc',
        customerGroup: {
          id: '2',
          name: 'Enterprise',
        },
      },
      {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@retail.com',
        company: 'Retail Solutions',
        customerGroup: {
          id: '1',
          name: 'Wholesale',
        },
      },
    ];

    // Filter by search term
    const filteredCustomers = mockCustomers.filter(customer => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        customer.firstName.toLowerCase().includes(searchLower) ||
        customer.lastName.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.company.toLowerCase().includes(searchLower)
      );
    });

    // Limit results
    const limitedCustomers = filteredCustomers.slice(0, limit);

    return NextResponse.json(limitedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
} 