import { NextResponse } from 'next/server';
import { Session } from 'next-auth';

import { MiddlewareFactory } from './compose-middlewares';

export const withB2B: MiddlewareFactory = (next) => {
  return (request, event) => {
    // Skip B2B middleware for login page to prevent redirect loops
    if (request.nextUrl.pathname === '/login') {
      return next(request, event);
    }
    
    // Only redirect B2B users if they're trying to access account pages
    // Redirect to embedded buyer portal (/?section=orders)
    // Don't redirect from login page to avoid loops
    if (
      request.auth?.b2bToken &&
      request.nextUrl.pathname.startsWith('/account/')
    ) {
      return NextResponse.redirect(new URL('/?section=orders', request.url));
    }

    // Don't redirect B2B users away from the homepage or embedded buyer portal
    if (
      request.auth?.b2bToken &&
      (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/?'))
    ) {
      return next(request, event);
    }

    // If user is not authenticated, don't apply B2B redirects
    if (!request.auth) {
      return next(request, event);
    }

    return next(request, event);
  };
};

declare module 'next/server' {
  interface NextRequest {
    auth: Session | null;
  }
} 