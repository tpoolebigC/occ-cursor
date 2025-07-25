import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { B2B_API_HOST, B2B_API_TOKEN, BIGCOMMERCE_CHANNEL_ID } = process.env;

    // Check if required environment variables are present
    if (!B2B_API_TOKEN) {
      return NextResponse.json(
        { error: 'B2B_API_TOKEN is not configured' },
        { status: 500 }
      );
    }

    if (!BIGCOMMERCE_CHANNEL_ID) {
      return NextResponse.json(
        { error: 'BIGCOMMERCE_CHANNEL_ID is not configured' },
        { status: 500 }
      );
    }

    // Test the B2B API connection
    const testUrl = `${B2B_API_HOST || 'https://api-b2b.bigcommerce.com/'}/api/io/auth/customers/storefront`;
    
    console.log('Testing B2B API connection:', {
      url: testUrl,
      hasToken: !!B2B_API_TOKEN,
      tokenLength: B2B_API_TOKEN?.length,
      channelId: BIGCOMMERCE_CHANNEL_ID,
      host: B2B_API_HOST
    });

    // Make a test request (this will fail with 400/401, but we can see if the connection works)
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authToken: B2B_API_TOKEN,
      },
      body: JSON.stringify({
        channelId: parseInt(BIGCOMMERCE_CHANNEL_ID, 10),
        customerId: 1, // Test with customer ID 1
        customerAccessToken: { value: 'test', expiresAt: new Date().toISOString() },
      }),
    });

    return NextResponse.json({
      success: true,
      environment: {
        hasB2BApiToken: !!B2B_API_TOKEN,
        tokenLength: B2B_API_TOKEN?.length,
        b2bApiHost: B2B_API_HOST,
        channelId: BIGCOMMERCE_CHANNEL_ID,
        testUrl
      },
      apiResponse: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      },
      message: response.ok 
        ? 'B2B API connection successful' 
        : 'B2B API connection failed (expected for test request)'
    });

  } catch (error) {
    console.error('B2B API test failed:', error);
    return NextResponse.json(
      { 
        error: 'B2B API test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 