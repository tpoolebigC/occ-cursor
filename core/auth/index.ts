import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';
import NextAuth, { type DefaultSession, type NextAuthConfig, User } from 'next-auth';
import 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { loginWithB2B } from '~/b2b/client';
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
  const response = await client.fetch({
    document: LoginMutation,
    variables: { email, password, cartEntityId },
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

  // Get B2B token if B2B API is configured
  let b2bToken: string | undefined;
  try {
    console.log('Checking B2B API configuration...');
    console.log('B2B_API_TOKEN exists:', !!process.env.B2B_API_TOKEN);
    console.log('B2B_API_HOST:', process.env.B2B_API_HOST);
    
    if (process.env.B2B_API_TOKEN) {
      console.log('Attempting B2B login for customer:', result.customer.entityId);
      b2bToken = await loginWithB2B({
        customerId: result.customer.entityId,
        customerAccessToken: result.customerAccessToken,
      });
      console.log('B2B login successful, token received');
    } else {
      console.log('B2B_API_TOKEN not configured, skipping B2B login');
    }
  } catch (error) {
    console.error('B2B login failed:', error);
    // Continue without B2B token if B2B API fails
  }

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    b2bToken,
    cartId: result.cart?.entityId ?? cartEntityId,
  };
}

async function loginWithJwt(jwt: string, cartEntityId?: string): Promise<User | null> {
  const claims = decodeJwt(jwt);
  const channelId = claims.channel_id?.toString() ?? process.env.BIGCOMMERCE_CHANNEL_ID;
  const impersonatorId = claims.impersonator_id?.toString() ?? null;
  const response = await client.fetch({
    document: LoginWithTokenMutation,
    variables: { jwt, cartEntityId },
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

  // Get B2B token if B2B API is configured
  let b2bToken: string | undefined;
  try {
    if (process.env.B2B_API_TOKEN) {
      console.log('Attempting B2B login for customer:', result.customer.entityId);
      b2bToken = await loginWithB2B({
        customerId: result.customer.entityId,
        customerAccessToken: result.customerAccessToken,
      });
      console.log('B2B login successful, token received');
    } else {
      console.log('B2B_API_TOKEN not configured, skipping B2B login');
    }
  } catch (error) {
    console.error('B2B login failed:', error);
    // Continue without B2B token if B2B API fails
  }

  return {
    name: `${result.customer.firstName} ${result.customer.lastName}`,
    email: result.customer.email,
    customerAccessToken: result.customerAccessToken.value,
    impersonatorId,
    b2bToken,
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

      if (token.cartId !== undefined) {
        session.user = {
          ...session.user,
          cartId: token.cartId,
        };
      }

      return session;
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
  }

  interface User {
    name?: string | null;
    email?: string | null;
    customerAccessToken?: string;
    impersonatorId?: string | null;
    b2bToken?: string;
    cartId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    customerAccessToken?: string;
    b2bToken?: string;
    cartId?: string | null;
  }
}
