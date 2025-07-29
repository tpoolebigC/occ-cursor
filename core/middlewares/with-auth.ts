import { NextResponse, URLPattern } from 'next/server';

import { anonymousSignIn, auth, clearAnonymousSession, getAnonymousSession } from '~/auth';

import { type MiddlewareFactory } from './compose-middlewares';

// Path matcher for any routes that require authentication
const protectedPathPattern = new URLPattern({ pathname: `{/:locale}?/(account)/*` });

function redirectToLogin(url: string) {
  return NextResponse.redirect(new URL('/login', url), { status: 302 });
}

export const withAuth: MiddlewareFactory = (next) => {
  return async (request, event) => {
    console.log('Auth Middleware Debug:', {
      url: request.nextUrl.toString(),
      pathname: request.nextUrl.pathname,
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
      method: request.method
    });
    
    // Skip auth middleware for login page to prevent redirect loops
    if (request.nextUrl.pathname === '/login') {
      return next(request, event);
    }
    
    // @ts-expect-error: The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
    const authWithCallback = auth(async (req) => {
      const anonymousSession = await getAnonymousSession();
      const isProtectedRoute = protectedPathPattern.test(req.nextUrl.toString().toLowerCase());
      const isGetRequest = req.method === 'GET';

      // Create the anonymous session if it doesn't exist
      if (!req.auth && !anonymousSession) {
        await anonymousSignIn();
      }

      // If the user is authenticated and there is an anonymous session, clear the anonymous session
      if (req.auth && anonymousSession) {
        await clearAnonymousSession();
      }

      if (!req.auth) {
        if (isProtectedRoute && isGetRequest) {
          return redirectToLogin(req.url);
        }

        return next(req, event);
      }

      const { customerAccessToken } = req.auth.user ?? {};
      const hasB2BToken = req.auth?.b2bToken;

      // Allow B2B users to access protected routes even without customerAccessToken
      // Also allow access to homepage with section parameters (embedded buyer portal)
      const hasSectionParams = req.nextUrl.searchParams.has('section');
      const isHomepageWithSection = req.nextUrl.pathname === '/' && hasSectionParams;
      
      // For B2B users, don't require customerAccessToken
      // For regular users, require customerAccessToken for protected routes
      if (isProtectedRoute && isGetRequest && !customerAccessToken && !hasB2BToken && !isHomepageWithSection) {
        return redirectToLogin(req.url);
      }

      // Continue the middleware chain
      return next(req, event);
    });

    // @ts-expect-error: The `auth` function doesn't have the correct type to support it as a MiddlewareFactory.
    return authWithCallback(request, event);
  };
};
