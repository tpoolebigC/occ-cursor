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

async function executeGet(
  url: URL,
  headers: Record<string, string>,
  displayHeaders: Record<string, string>,
): Promise<VerboseExchange> {
  const exchange: VerboseExchange = {
    request: { method: 'GET', url: url.toString(), headers: displayHeaders },
    response: { status: 0, statusText: '', durationMs: 0, body: null },
  };

  const started = Date.now();

  try {
    const response = await fetch(url, { headers, cache: 'no-store' });

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

/**
 * Runs the call with the current auth scheme (X-Auth-Token + X-Store-Hash,
 * store-level V3 token with B2B Edition scope). If that is rejected and a
 * legacy JWT-style B2B token is configured, retries ONCE with the deprecated
 * `authToken` header (never combined with X-Store-Hash) so the bench also
 * demonstrates the auth-migration story live. Returns one exchange per attempt.
 */
export async function managementGet(
  path: string,
  params?: Record<string, string | number | undefined>,
  compareLegacy = false,
): Promise<VerboseExchange[]> {
  // Prefer a dedicated token so the app-wide BIGCOMMERCE_ACCESS_TOKEN is untouched.
  const storeToken = process.env.B2B_MANAGEMENT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
  const legacyToken = process.env.B2B_API_TOKEN;
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;

  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
  }

  const exchanges: VerboseExchange[] = [];

  if (storeToken && storeHash) {
    exchanges.push(
      await executeGet(
        url,
        { 'X-Auth-Token': storeToken, 'X-Store-Hash': storeHash, Accept: 'application/json' },
        {
          'X-Auth-Token': `${redact(storeToken)} — store-level V3 token (current scheme)`,
          'X-Store-Hash': storeHash,
          Accept: 'application/json',
        },
      ),
    );

    const status = exchanges[0]?.response.status ?? 0;

    if (!compareLegacy && status !== 401 && status !== 403) return exchanges;
  }

  if (legacyToken) {
    const legacy = await executeGet(
      url,
      { authToken: legacyToken, Accept: 'application/json' },
      {
        authToken: `${redact(legacyToken)} — LEGACY header (deprecated 2025-09-30; shown as fallback)`,
        Accept: 'application/json',
      },
    );

    exchanges.push(legacy);
  }

  if (exchanges.length === 0) {
    exchanges.push({
      request: { method: 'GET', url: url.toString(), headers: {} },
      response: { status: 0, statusText: '', durationMs: 0, body: null },
      error:
        'No credentials configured — set BIGCOMMERCE_ACCESS_TOKEN (+ BIGCOMMERCE_STORE_HASH) or B2B_API_TOKEN in .env.local.',
    });
  }

  return exchanges;
}
