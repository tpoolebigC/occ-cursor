import { z } from 'zod';

/**
 * B2B Client Service
 * Handles B2B API authentication and token management
 * 
 * Authentication updated per B2B Edition docs (Sept 2025):
 * Server-to-server requests now use X-Auth-Token + X-Store-Hash
 * instead of the deprecated authToken header.
 * See: https://developer.bigcommerce.com/b2b-edition/docs/authentication
 */

interface LoginWithB2BParams {
  customerId: number;
  customerAccessToken: {
    value: string;
    expiresAt: string;
  };
}

// Environment validation schema - updated for new auth
const ENV = z
  .object({
    env: z.object({
      B2B_X_AUTH_TOKEN: z.string(),
      BIGCOMMERCE_STORE_HASH: z.string(),
      BIGCOMMERCE_CHANNEL_ID: z.string(),
      B2B_API_HOST: z.string().default('https://api-b2b.bigcommerce.com'),
    }),
  })
  .transform(({ env }) => env);

// API response schemas
const ErrorResponse = z.object({
  detail: z.string().default('Unknown error'),
});

const B2BTokenResponseSchema = z.object({
  data: z.object({
    token: z.array(z.string()).nonempty({ message: 'No token returned from B2B API' }),
  }),
});

/**
 * Login with B2B API
 * Authenticates a customer with the B2B API and returns a B2B storefront token.
 * Uses the new X-Auth-Token + X-Store-Hash authentication headers.
 */
export async function loginWithB2B({ customerId, customerAccessToken }: LoginWithB2BParams): Promise<string> {
  const { B2B_API_HOST, B2B_X_AUTH_TOKEN, BIGCOMMERCE_STORE_HASH, BIGCOMMERCE_CHANNEL_ID } = ENV.parse(process);

  const apiUrl = `${B2B_API_HOST}/api/io/auth/customers/storefront`;
  
  console.log('B2B API call details:', {
    url: apiUrl,
    host: B2B_API_HOST,
    channelId: BIGCOMMERCE_CHANNEL_ID,
    customerId,
    hasToken: !!B2B_X_AUTH_TOKEN,
    hasStoreHash: !!BIGCOMMERCE_STORE_HASH,
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': B2B_X_AUTH_TOKEN,
        'X-Store-Hash': BIGCOMMERCE_STORE_HASH,
      },
      body: JSON.stringify({
        channelId: parseInt(BIGCOMMERCE_CHANNEL_ID, 10),
        customerId: parseInt(customerId.toString(), 10),
        customerAccessToken,
      }),
    });

    console.log('B2B API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = ErrorResponse.parse(errorData).detail;

      throw new Error(
        `Failed to login with ${B2B_API_HOST}. Status: ${response.status}, Message: ${errorMessage}`,
      );
    }

    const responseData = await response.json();
    console.log('B2B API success response received');
    
    return B2BTokenResponseSchema.parse(responseData).data.token[0];
  } catch (error) {
    console.error('B2B API login error:', error);
    throw error;
  }
} 