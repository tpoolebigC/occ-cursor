/**
 * B2B Edition REST Management V3 client — Watts demo test bench.
 *
 * Uses the CURRENT auth scheme (required since Sept 30, 2025):
 *   X-Auth-Token: store-level API token with the B2B Edition scope set to "modify"
 *   X-Store-Hash: the store hash
 * The legacy `authToken` header is deprecated and must not be mixed with X-Store-Hash.
 *
 * Spec: https://docs.bigcommerce.com/openapi/b2b-management.json (85 paths)
 * Server base: https://api-b2b.bigcommerce.com/api/v3/io
 *
 * Every call returns a VerboseExchange so the UI can render the full
 * request → response payload (this doubles as the "verbose logging" demo).
 */

const BASE_URL = `${process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com'}/api/v3/io`;

export interface VerboseExchange {
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
  };
  response: {
    status: number;
    statusText: string;
    durationMs: number;
    body: unknown;
  };
  error?: string;
}

function redact(token: string | undefined): string {
  if (!token) return '(not configured)';
  return `${token.slice(0, 4)}…${token.slice(-4)} (redacted)`;
}

export async function managementGet(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<VerboseExchange> {
  const token = process.env.B2B_API_TOKEN;
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
  }

  const displayHeaders = {
    'X-Auth-Token': redact(token),
    'X-Store-Hash': storeHash || '(not configured)',
    Accept: 'application/json',
  };

  const exchange: VerboseExchange = {
    request: { method: 'GET', url: url.toString(), headers: displayHeaders },
    response: { status: 0, statusText: '', durationMs: 0, body: null },
  };

  if (!token || !storeHash) {
    exchange.error =
      'Missing B2B_API_TOKEN or BIGCOMMERCE_STORE_HASH in the environment — configure both in .env.local.';
    return exchange;
  }

  const started = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': token,
        'X-Store-Hash': storeHash,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    exchange.response.durationMs = Date.now() - started;
    exchange.response.status = response.status;
    exchange.response.statusText = response.statusText;

    const text = await response.text();

    try {
      exchange.response.body = JSON.parse(text);
    } catch {
      exchange.response.body = text.slice(0, 2000);
    }
  } catch (fetchError) {
    exchange.response.durationMs = Date.now() - started;
    exchange.error = fetchError instanceof Error ? fetchError.message : String(fetchError);
  }

  return exchange;
}
