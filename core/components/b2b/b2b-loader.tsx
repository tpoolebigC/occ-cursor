import { z } from 'zod';

import { auth } from '~/auth';

import { B2BScript } from './b2b-script';

const EnvironmentSchema = z.object({
  BIGCOMMERCE_STORE_HASH: z.string({ message: 'BIGCOMMERCE_STORE_HASH is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
  B2B_API_HOST: z.string().optional(),
  B2B_API_TOKEN: z.string().optional(),
  NEXT_PUBLIC_BUYER_PORTAL_URL: z.string().optional(),
  STAGING_B2B_CDN_ORIGIN: z.string().optional(),
});

export async function B2BLoader() {
  const {
    BIGCOMMERCE_STORE_HASH,
    BIGCOMMERCE_CHANNEL_ID,
    B2B_API_HOST,
    B2B_API_TOKEN,
    NEXT_PUBLIC_BUYER_PORTAL_URL,
    STAGING_B2B_CDN_ORIGIN,
  } = EnvironmentSchema.parse(process.env);

  const session = await auth();
  
  // For now, we'll use production environment
  // In a real B2B setup, you'd have a b2bToken in the session
  const environment = STAGING_B2B_CDN_ORIGIN === 'true' ? 'staging' : 'production';

  console.log('B2B Loader Debug:', {
    storeHash: BIGCOMMERCE_STORE_HASH,
    channelId: BIGCOMMERCE_CHANNEL_ID,
    environment,
    hasB2BApiHost: !!B2B_API_HOST,
    hasB2BApiToken: !!B2B_API_TOKEN,
    buyerPortalUrl: NEXT_PUBLIC_BUYER_PORTAL_URL,
    session: session ? 'exists' : 'none',
    hasB2BToken: !!session?.b2bToken,
    hasCartId: !!session?.user?.cartId,
    sessionUser: session?.user ? {
      name: session.user.name,
      email: session.user.email,
      hasCartId: !!session.user.cartId
    } : null
  });

  return (
    <B2BScript
      cartId={session?.user?.cartId ?? undefined}
      channelId={BIGCOMMERCE_CHANNEL_ID}
      environment={environment}
      storeHash={BIGCOMMERCE_STORE_HASH}
      token={session?.b2bToken}
    />
  );
} 