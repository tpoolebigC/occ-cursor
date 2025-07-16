import { NextResponse } from 'next/server';
import { Session } from 'next-auth';

import { MiddlewareFactory } from './compose-middlewares';

export const withB2B: MiddlewareFactory = (next) => {
  return (request, event) => {
    const { pathname } = request.nextUrl;
    
    // Handle B2B authentication redirects
    // Don't redirect from business login page - allow access to it
    if (
      request.auth?.b2bToken &&
      (pathname.startsWith('/account/') ||
        pathname.startsWith('/login')) &&
      !pathname.startsWith('/business/login')
    ) {
      return NextResponse.redirect(new URL('/business', request.url));
    }

    // For other routes, let the next middleware handle them
    const response = next(request, event);

    // Add B2B headers if user has B2B token and response is a NextResponse
    if (request.auth?.b2bToken && response instanceof NextResponse) {
      if (pathname.startsWith('/checkout')) {
        // Add B2B session headers for checkout sync
        response.headers.set('x-b2b-session', 'true');
        response.headers.set('x-b2b-token', request.auth.b2bToken);
      } else if (pathname.startsWith('/cart')) {
        // Add B2B cart sync headers
        response.headers.set('x-b2b-cart-sync', 'true');
      }
    }

    return response;
  };
};

declare module 'next/server' {
  interface NextRequest {
    auth: Session | null;
  }
} 