/**
 * Server-side auth utilities
 * 
 * This file exports auth functions that are safe to use in server components and API routes.
 * These functions should NOT be imported in client components.
 */

export { handlers, auth, signIn, signOut, updateSession } from './index';
export { getSessionCustomerAccessToken, isLoggedIn } from './index';

// Server-side functions
export {
  anonymousSignIn,
  clearAnonymousSession,
  getAnonymousSession,
  updateAnonymousSession,
} from './server'; 