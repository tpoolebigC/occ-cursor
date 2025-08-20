import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const B2B_API_HOST = process.env.B2B_API_HOST;
  const B2B_API_TOKEN = process.env.B2B_API_TOKEN;

  if (!B2B_API_HOST || !B2B_API_TOKEN) {
    return NextResponse.json(
      { error: 'B2B API configuration missing' },
      { status: 500 }
    );
  }

  const quotesUrl = `${B2B_API_HOST}/api/io/quotes`;

  try {
    const response = await fetch(quotesUrl, {
      headers: {
        'authToken': B2B_API_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('B2B quotes API response:', response.status, response.statusText);
      return NextResponse.json(
        { error: `B2B API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error testing B2B quotes API:', error);
    return NextResponse.json(
      { error: 'Failed to test B2B API' },
      { status: 500 }
    );
  }
} 