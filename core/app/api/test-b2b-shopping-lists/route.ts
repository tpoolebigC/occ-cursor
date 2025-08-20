import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/auth';

export async function GET(request: NextRequest) {
  try {
    const { B2B_API_HOST, B2B_API_TOKEN } = process.env;
    
    console.log('🔍 [B2B Test] Testing shopping lists endpoint...');
    console.log('🔍 [B2B Test] B2B_API_HOST:', B2B_API_HOST);
    console.log('🔍 [B2B Test] Has B2B_API_TOKEN:', !!B2B_API_TOKEN);

    // Get session to get customer access token
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      return NextResponse.json({
        success: false,
        error: 'No customer access token available in session',
        message: 'Please log in to test shopping lists'
      }, { status: 200 });
    }

    // Get customer ID from GraphQL API
    const { client } = await import('~/client/server-client');
    const { graphql } = await import('~/client/graphql');
    
    const GET_CUSTOMER_INFO = graphql(`
      query GetCustomerInfo {
        customer {
          entityId
          firstName
          lastName
          email
        }
      }
    `);

    const customerResponse = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken: session.user.customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const customerId = customerResponse.data?.customer?.entityId;
    console.log('🔍 [B2B Test] Customer ID from GraphQL:', customerId);

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'No customer ID available from GraphQL API',
        message: 'Please log in to test shopping lists'
      }, { status: 200 });
    }

    // Test the shopping lists endpoint
    const shoppingListsUrl = `${B2B_API_HOST}/api/v3/io/shopping-list?customerId=${customerId}`;
    console.log('🔍 [B2B Test] Testing URL:', shoppingListsUrl);

    const response = await fetch(shoppingListsUrl, {
      headers: {
        'authToken': B2B_API_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 [B2B Test] Response status:', response.status);
    console.log('🔍 [B2B Test] Response status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 [B2B Test] Error response:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `B2B API error: ${response.status} ${response.statusText}`,
        details: errorText,
        url: shoppingListsUrl,
        status: response.status,
        customerId
      }, { status: 200 });
    }

    const data = await response.json();
    console.log('🔍 [B2B Test] Success response:', data);

    return NextResponse.json({
      success: true,
      data,
      url: shoppingListsUrl,
      customerId
    });

  } catch (error) {
    console.error('🔍 [B2B Test] Exception:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: `${process.env.B2B_API_HOST}/api/v3/io/shopping-list`
    }, { status: 200 });
  }
} 