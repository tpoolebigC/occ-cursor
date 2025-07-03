import Script from 'next/script';

export function B2BScript() {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;

  console.log('B2B Script Debug:', {
    storeHash,
    channelId,
    b2bApiHost: process.env.B2B_API_HOST,
    b2bApiToken: process.env.B2B_API_TOKEN ? 'SET' : 'NOT SET'
  });

  return (
    <>
      <Script id="b2b-config" strategy="beforeInteractive">
        {`
        console.log('B2B Script Loading...');
        window.b3CheckoutConfig = {
          routes: {
            dashboard: '/#/dashboard',
          },
        }
        window.B3 = {
          setting: {
            store_hash: '${storeHash}',  
            channel_id: ${channelId},
          },
        }
        console.log('B2B Config:', window.B3);
        `}
      </Script>
      <Script
        type="module"
        crossOrigin=""
        src="https://buyer-portal.bigcommerce.com/index.*.js"
        strategy="afterInteractive"
      />
      <Script
        noModule
        crossOrigin=""
        src="https://buyer-portal.bigcommerce.com/polyfills-legacy.*.js"
        strategy="afterInteractive"
      />
      <Script
        noModule
        crossOrigin=""
        src="https://buyer-portal.bigcommerce.com/index-legacy.*.js"
        strategy="afterInteractive"
      />
    </>
  );
} 