import { z } from 'zod';

/**
 * B2B Client Service
 * Handles B2B API authentication and token management
 */

interface LoginWithB2BParams {
  customerId: number;
  customerAccessToken: {
    value: string;
    expiresAt: string;
  };
}

// Environment validation schema
const ENV = z
  .object({
    env: z.object({
      B2B_API_TOKEN: z.string(),
      BIGCOMMERCE_CHANNEL_ID: z.string(),
      B2B_API_HOST: z.string().default('https://api-b2b.bigcommerce.com/'),
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
 * Authenticates a customer with the B2B API and returns a B2B token
 */
export async function loginWithB2B({ customerId, customerAccessToken }: LoginWithB2BParams): Promise<string> {
  const { B2B_API_HOST, B2B_API_TOKEN, BIGCOMMERCE_CHANNEL_ID } = ENV.parse(process);

  const apiUrl = `${B2B_API_HOST}/api/io/auth/customers/storefront`;
  
  console.log('B2B API call details:', {
    url: apiUrl,
    host: B2B_API_HOST,
    channelId: BIGCOMMERCE_CHANNEL_ID,
    customerId,
    hasToken: !!B2B_API_TOKEN,
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authToken: B2B_API_TOKEN,
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