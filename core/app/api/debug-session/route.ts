import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    return NextResponse.json({
      hasSession: !!session,
      user: session?.user ? {
        hasCustomerAccessToken: !!session.user.customerAccessToken,
        customerAccessToken: session.user.customerAccessToken ? '***' : null,
        cartId: session.user.cartId,
      } : null,
      b2bToken: session?.b2bToken ? '***' : null,
      hasB2bToken: !!session?.b2bToken,
      url: request.nextUrl.toString(),
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      url: request.nextUrl.toString(),
    });
  }
} 