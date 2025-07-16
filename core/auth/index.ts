import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import NextAuth, { type DefaultSession, type NextAuthConfig, User } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { b2bClient } from '~/lib/b2b/client';
import { getCartId } from '~/lib/cart';

const LoginMutation = graphql(`
  mutation Login($email: String!, $password: String!, $cartEntityId: String) {
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
  mutation LoginWithCustomerLoginJwt($jwt: String!, $cartEntityId: String) {
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
  mutation LogoutMutation {
    logout {
      result
    }
  }
`);

const PasswordCredentials = z.object({
  type: z.literal('password'),
  email: z.string().email(),
  password: z.string().min(1),
});

const JwtCredentials = z.object({
  type: z.literal('jwt'),
  jwt: z.string(),
});

export const Credentials = z.discriminatedUnion('type', [PasswordCredentials, JwtCredentials]);

async function loginWithPassword(
  email: string,
  password: string,
  cartEntityId?: string,
): Promise<User | null> {
  let response;
  try {
    response = await client.fetch({
      document: LoginMutation,
      variables: { email, password, cartEntityId },
      fetchOptions: {
        cache: 'no-store',
      },
    });
  } catch (error) {
    console.error('Login fetch failed:', error);
    return null;
  }

  if (response.errors && response.errors.length > 0) {
    return null;
  }

  const result = response.data.login;

  if (!result.customer || !result.customerAccessToken) {
    return null;
  }

  // Check if user is a B2B customer before attempting B2B login
  let b2bToken: string | undefined;
  let isB2BCustomer = false;
  
  try {
    if (process.env.B2B_API_TOKEN) {
      // First, check if this customer exists in B2B system
      const b2bProfile = await b2bClient.getCustomerProfile(result.customer.entityId);
      if (b2bProfile) {
        isB2BCustomer = true;
        // Now attempt to get B2B token
        b2bToken = await b2bClient.loginWithB2B(
          result.customer.entityId,
          result.customerAccessToken,
        );
      }
    }
  } catch (error) {
    console.error('B2B login check failed:', error);
    // Continue without B2B token - user is not a B2B customer
    isB2BCustomer = false;
  }

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    b2bToken,
    isB2BCustomer,
    cartId: result.cart?.entityId ?? cartEntityId,
  };
}

async function loginWithJwt(jwt: string, cartEntityId?: string): Promise<User | null> {
  const claims = decodeJwt(jwt);
  const channelId = claims.channel_id?.toString() ?? process.env.BIGCOMMERCE_CHANNEL_ID;
  const impersonatorId = claims.impersonator_id?.toString() ?? null;
  
  let response;
  try {
    response = await client.fetch({
      document: LoginWithTokenMutation,
      variables: { jwt, cartEntityId },
      channelId,
      fetchOptions: {
        cache: 'no-store',
      },
    });
  } catch (error) {
    console.error('JWT login fetch failed:', error);
    return null;
  }

  if (response.errors && response.errors.length > 0) {
    return null;
  }

  const result = response.data.loginWithCustomerLoginJwt;

  if (!result.customer || !result.customerAccessToken) {
    return null;
  }

  // Check if user is a B2B customer before attempting B2B login
  let b2bToken: string | undefined;
  let isB2BCustomer = false;
  
  try {
    if (process.env.B2B_API_TOKEN) {
      // First, check if this customer exists in B2B system
      const b2bProfile = await b2bClient.getCustomerProfile(result.customer.entityId);
      if (b2bProfile) {
        isB2BCustomer = true;
        // Now attempt to get B2B token
        b2bToken = await b2bClient.loginWithB2B(
          result.customer.entityId,
          result.customerAccessToken,
        );
      }
    }
  } catch (error) {
    console.error('B2B login check failed:', error);
    // Continue without B2B token - user is not a B2B customer
    isB2BCustomer = false;
  }

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
    b2bToken,
    isB2BCustomer,
    cartId: result.cart?.entityId ?? cartEntityId,
  };
}

async function authorize(credentials: unknown): Promise<User | null> {
  const parsed = Credentials.parse(credentials);
  const cartEntityId = await getCartId();

  switch (parsed.type) {
    case 'password': {
      const { email, password } = parsed;

      return loginWithPassword(email, password, cartEntityId);
    }

    case 'jwt': {
      const { jwt } = parsed;

      return loginWithJwt(jwt, cartEntityId);
    }

    default:
      return null;
  }
}

const config = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      // user can actually be undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.customerAccessToken) {
        token.customerAccessToken = user.customerAccessToken;
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.b2bToken) {
        token.b2bToken = user.b2bToken;
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.isB2BCustomer !== undefined) {
        token.isB2BCustomer = user.isB2BCustomer;
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user?.cartId) {
        token.cartId = user.cartId;
      }

      return token;
    },
    session({ session, token }) {
      if (token.customerAccessToken) {
        session.customerAccessToken = token.customerAccessToken;
      }

      if (token.b2bToken) {
        session.b2bToken = token.b2bToken;
      }

      if (token.isB2BCustomer !== undefined) {
        session.isB2BCustomer = token.isB2BCustomer;
      }

      if (token.cartId !== undefined) {
        session.user = {
          ...session.user,
          cartId: token.cartId,
        };
      }

      return session;
    },
    redirect({ url, baseUrl }) {
      // Check if the user has a B2B token to determine redirect destination
      // This will be handled by the individual login forms
      if (url.startsWith(baseUrl)) {
              // For business login, let the form handle the redirect
      if (url.includes('/business/login')) {
        return `${baseUrl}/business`;
      }
        // For regular login, redirect to account page
        return `${baseUrl}/account/orders`;
      }
      // For external URLs, allow them
      return url;
    },
  },
  events: {
    async signOut(message) {
      const customerAccessToken = 'token' in message ? message.token?.customerAccessToken : null;

      if (customerAccessToken) {
        try {
          await client.fetch({
            document: LogoutMutation,
            variables: {},
            customerAccessToken,
            fetchOptions: {
              cache: 'no-store',
            },
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        type: { type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        jwt: { type: 'text' },
      },
      authorize,
    }),
  ],
} satisfies NextAuthConfig;

const { handlers, auth, signIn: nextAuthSignIn, signOut } = NextAuth(config);

const signIn = (
  credentials: z.infer<typeof Credentials>,
  options: { redirect?: boolean | undefined; redirectTo?: string },
) => nextAuthSignIn('credentials', { ...credentials, ...options });

const getSessionCustomerAccessToken = async () => {
  try {
    const session = await auth();

    return session?.customerAccessToken;
  } catch {
    // No empty
  }
};

export { handlers, auth, signIn, signOut, getSessionCustomerAccessToken };

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      cartId?: string | null;
    };
    customerAccessToken?: string;
    b2bToken?: string;
    isB2BCustomer?: boolean;
  }

  interface User {
    name?: string | null;
    email?: string | null;
    customerAccessToken?: string;
    impersonatorId?: string | null;
    b2bToken?: string;
    isB2BCustomer?: boolean;
    cartId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    customerAccessToken?: string;
    b2bToken?: string;
    isB2BCustomer?: boolean;
    cartId?: string | null;
  }
}
