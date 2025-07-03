import Script from 'next/script';

export function B2BScript() {
  return (
    <>
      <Script>
        {`
        window.b3CheckoutConfig = {
          routes: {
            dashboard: '/#/dashboard',
          },
        }
        window.B3 = {
          setting: {
            store_hash: '${process.env.BIGCOMMERCE_STORE_HASH}',  
            channel_id: ${process.env.BIGCOMMERCE_CHANNEL_ID},
          },
        }
        `}
      </Script>
      <Script
        type="module"
        crossOrigin=""
        src="https://buyer-portal.bigcommerce.com/index.*.js"
      />
      <Script
        noModule
        crossOrigin=""
        src="https://buyer-portal.bigcommerce.com/polyfills-legacy.*.js"
      />
      <Script
        noModule
        crossOrigin=""
        src="https://buyer-portal.bigcommerce.com/index-legacy.*.js"
      />
    </>
  );
} 