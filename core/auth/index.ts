/**
 * Auth Configuration
 * 
 * This file contains the NextAuth configuration and exports.
 * Server-side functions are exported from './server' only.
 */

import { decodeJwt } from 'jose';
import NextAuth, { type NextAuthConfig, User } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { loginWithB2B } from '~/features/b2b/services/client';
import { serverClient as client } from '~/client/server-client';
import { graphql } from '~/client/graphql';
import { clearCartId, setCartId } from '~/lib/cart';
import './types';

const LoginMutation = graphql(`
  mutation LoginMutation($email: String!, $password: String!, $cartEntityId: String) {
    login(email: $email, password: $password, guestCartEntityId: $cartEntityId) {
      customerAccessToken {
        value
        expiresAt
      }
      customer {
        entityId
        firstName
        lastName
        email
      }
      cart {
        entityId
      }
    }
  }
`);

const LoginWithTokenMutation = graphql(`
  mutation LoginWithCustomerLoginJwtMutation($jwt: String!, $cartEntityId: String) {
    loginWithCustomerLoginJwt(jwt: $jwt, guestCartEntityId: $cartEntityId) {
      customerAccessToken {
        value
        expiresAt
      }
      customer {
        entityId
        firstName
        lastName
        email
      }
      cart {
        entityId
      }
    }
  }
`);

const LogoutMutation = graphql(`
  mutation LogoutMutation($cartEntityId: String) {
    logout(cartEntityId: $cartEntityId) {
      result
      cartUnassignResult {
        cart {
          entityId
        }
      }
    }
  }
`);

const cartIdSchema = z
  .string()
  .uuid()
  .or(z.literal('undefined')) // auth.js seems to pass the cart id as a string literal 'undefined' when not set.
  .optional()
  .transform((val) => (val === 'undefined' ? undefined : val));

const PasswordCredentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  cartId: cartIdSchema,
});

const JwtCredentials = z.object({
  jwt: z.string(),
  cartId: cartIdSchema,
});

const SessionUpdate = z.object({
  user: z.object({
    cartId: cartIdSchema,
  }),
});

async function handleLoginCart(guestCartId?: string, loginResultCartId?: string) {
  // This function is only called from server-side auth providers
  // Server-side notifications are handled separately to avoid client-side imports
  
  if (loginResultCartId) {
    await setCartId(loginResultCartId);
  }
}

async function loginWithPassword(credentials: unknown): Promise<User | null> {
  const { email, password, cartId } = PasswordCredentials.parse(credentials);

  const response = await client.fetch({
    document: LoginMutation,
    variables: { email, password, cartEntityId: cartId },
    fetchOptions: {
      cache: 'no-store',
    },
  });

  if (response.errors && response.errors.length > 0) {
    return null;
  }

  const result = response.data.login;

  if (!result.customer || !result.customerAccessToken) {
    return null;
  }

  await handleLoginCart(cartId, result.cart?.entityId);

  const b2bToken = await loginWithB2B({
    customerId: result.customer.entityId,
    customerAccessToken: result.customerAccessToken,
  });

  // await clearAnonymousSession(); // Server-side function - handled separately

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    cartId: result.cart?.entityId,
    b2bToken,
  };
}

async function loginWithJwt(credentials: unknown): Promise<User | null> {
  const { jwt, cartId } = JwtCredentials.parse(credentials);

  const claims = decodeJwt(jwt);
  const channelId = claims.channel_id?.toString() ?? process.env.BIGCOMMERCE_CHANNEL_ID;
  const impersonatorId = claims.impersonator_id?.toString() ?? null;
  const response = await client.fetch({
    document: LoginWithTokenMutation,
    variables: { jwt, cartEntityId: cartId },
    channelId,
    fetchOptions: {
      cache: 'no-store',
    },
  });

  if (response.errors && response.errors.length > 0) {
    return null;
  }

  const result = response.data.loginWithCustomerLoginJwt;

  if (!result.customer || !result.customerAccessToken) {
    return null;
  }

  await handleLoginCart(cartId, result.cart?.entityId);

  const b2bToken = await loginWithB2B({
    customerId: result.customer.entityId,
    customerAccessToken: result.customerAccessToken,
  });

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
    cartId: result.cart?.entityId,
    b2bToken,
  };
}

// configure NextAuth cookies to work inside of the Makeswift Builder's canvas
const partitionedCookie = (name?: string) => ({
  name,
  options: {
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    partitioned: true,
  },
});

const config = {
  // Explicitly setting this value to be undefined. We want the library to handle CSRF checks when taking sensitive actions.
  // When handling sensitive actions like sign in, sign out, etc., the library will automatically check for CSRF tokens.
  // If you need to implement your own sensitive actions, you will need to implement CSRF checks yourself.
  skipCSRFCheck: undefined,
  // Set this environment variable if you want to trust the host when using `next build` & `next start`.
  // Otherwise, this will be controlled by process.env.NODE_ENV within the library.
  trustHost: process.env.AUTH_TRUST_HOST === 'true' ? true : undefined,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      },
    },
    callbackUrl: partitionedCookie(),
    csrfToken: partitionedCookie(),
    pkceCodeVerifier: partitionedCookie(),
    state: partitionedCookie(),
    nonce: partitionedCookie(),
    webauthnChallenge: partitionedCookie(),
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  callbacks: {
    jwt: ({ token, user, session, trigger }) => {
      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.customerAccessToken) {
        token.user = {
          ...token.user,
          customerAccessToken: user.customerAccessToken,
        };
      }

      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.b2bToken) {
        token.b2bToken = user.b2bToken;
      }

      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.cartId) {
        token.user = {
          ...token.user,
          cartId: user.cartId,
        };
      }

      if (trigger === 'update') {
        const parsedSession = SessionUpdate.safeParse(session);

        if (parsedSession.success) {
          token.user = {
            ...token.user,
            cartId: parsedSession.data.user.cartId,
          };
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.user?.customerAccessToken) {
        session.user.customerAccessToken = token.user.customerAccessToken;
      }

      if (token.user?.cartId !== undefined) {
        session.user.cartId = token.user.cartId;
      }

      if (token.b2bToken) {
        session.b2bToken = token.b2bToken;
      }

      return session;
    },
  },
  events: {
    async signOut(message) {
      const cartEntityId = 'token' in message ? message.token?.user?.cartId : null;
      const customerAccessToken =
        'token' in message ? message.token?.user?.customerAccessToken : null;

      if (customerAccessToken) {
        try {
          // Call BigCommerce logout to unassign cart
          await client.fetch({
            document: LogoutMutation,
            variables: {
              cartEntityId,
            },
            customerAccessToken,
            fetchOptions: {
              cache: 'no-store',
            },
          });
          
          // Cart restoration will be handled by the middleware or session management
          // This prevents the logout loop by not trying to manipulate cart state here
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Logout error:', error);
        }
      }
    },
  },
  providers: [
    CredentialsProvider({
      id: 'password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        cartId: { type: 'text' },
      },
      authorize: loginWithPassword,
    }),
    CredentialsProvider({
      id: 'jwt',
      credentials: {
        jwt: { type: 'text' },
        cartId: { type: 'text' },
      },
      authorize: loginWithJwt,
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut, unstable_update: updateSession } = NextAuth(config);

// Server-side functions - these should only be imported from './server-only'
// Client components should use useSession() from next-auth/react instead
export const getSessionCustomerAccessToken = async () => {
  try {
    const session = await auth();

    return session?.user?.customerAccessToken;
  } catch {
    // No empty
  }
};

export const isLoggedIn = async () => {
  try {
    const session = await auth();
    const cat = session?.user?.customerAccessToken;
    const b2bToken = session?.b2bToken;

    return Boolean(cat || b2bToken);
  } catch {
    return false;
  }
};

// Note: Server-side functions like anonymousSignIn, clearAnonymousSession, etc.
// are exported from './server-only' and should only be imported in server contexts

export {
  anonymousSignIn,
  clearAnonymousSession,
  getAnonymousSession,
  updateAnonymousSession,
} from './server';
