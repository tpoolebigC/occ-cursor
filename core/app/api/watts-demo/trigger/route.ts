import { NextResponse } from 'next/server';

/**
 * "Fire test event" — makes a real catalog change so BigCommerce emits a
 * store/product/updated webhook, closing the demo loop:
 *   bench button → core V3 API (request/response shown) → platform emits event
 *   → tunnel → /api/watts-demo/webhooks → inbound log panel.
 */

export async function POST() {
  const token = process.env.B2B_MANAGEMENT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  if (!token || !storeHash) {
    return NextResponse.json({ error: 'Missing token/store hash' }, { status: 500 });
  }

  const base = `https://api.bigcommerce.com/stores/${storeHash}/v3`;
  const headers = { 'X-Auth-Token': token, 'Content-Type': 'application/json', Accept: 'application/json' };

  // Grab one product, then touch its search keywords (invisible to shoppers,
  // guaranteed to emit store/product/updated).
  const listResponse = await fetch(`${base}/catalog/products?limit=1`, { headers, cache: 'no-store' });
  const list = await listResponse.json();
  const product = list.data?.[0];

  if (!product) {
    return NextResponse.json({ error: 'No products found' }, { status: 404 });
  }

  const stamp = `watts-demo-${Date.now()}`;
  const started = Date.now();
  const updateResponse = await fetch(`${base}/catalog/products/${product.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ search_keywords: stamp }),
    cache: 'no-store',
  });
  const update = await updateResponse.json();

  return NextResponse.json({
    request: {
      method: 'PUT',
      url: `${base}/catalog/products/${product.id}`,
      headers: { 'X-Auth-Token': `${token.slice(0, 4)}…${token.slice(-4)} (redacted)` },
      body: { search_keywords: stamp },
    },
    response: {
      status: updateResponse.status,
      statusText: updateResponse.statusText,
      durationMs: Date.now() - started,
      body: { productId: product.id, name: update.data?.name, search_keywords: update.data?.search_keywords },
    },
  });
}
