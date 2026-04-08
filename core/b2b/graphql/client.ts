/**
 * B2B GraphQL API Client
 *
 * Server-side client for the B2B Edition GraphQL API at api-b2b.bigcommerce.com/graphql.
 * Authenticates with the B2B storefront token (b2bToken) obtained during login.
 *
 * This replaces the B2B REST Management API and BC V2 REST API for all B2B data:
 * orders, quotes, invoices, shopping lists, addresses, users, company, masquerade, catalog.
 */

import { auth } from '~/auth';

const B2B_GRAPHQL_URL =
  (process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com') + '/graphql';

export class B2BGraphQLError extends Error {
  code: number;
  errors: B2BErrorDetail[];

  constructor(message: string, code: number, errors: B2BErrorDetail[]) {
    super(message);
    this.name = 'B2BGraphQLError';
    this.code = code;
    this.errors = errors;
  }
}

export class B2BAuthError extends B2BGraphQLError {
  constructor(message: string, code: number, errors: B2BErrorDetail[]) {
    super(message, code, errors);
    this.name = 'B2BAuthError';
  }
}

interface B2BErrorDetail {
  message: string;
  extensions?: { code?: number };
}

interface B2BGraphQLResponse<T> {
  data: T;
  errors?: B2BErrorDetail[];
}

interface B2BQueryOptions {
  /**
   * Override the b2bToken from the session. Useful for masquerade or
   * company-switching flows where a different token is in play.
   */
  token?: string;
  /**
   * Extra headers merged into the request (e.g. for tracing).
   */
  headers?: Record<string, string>;
}

/**
 * Execute a query or mutation against the B2B GraphQL API.
 *
 * Token resolution order:
 *   1. Explicit `options.token`
 *   2. `session.b2bToken` from NextAuth
 *
 * Throws `B2BAuthError` for expired/invalid tokens (code 40101)
 * so callers can trigger a re-login flow.
 */
export async function b2bGraphQL<TData = unknown, TVars = Record<string, unknown>>(
  document: string,
  variables?: TVars,
  options?: B2BQueryOptions,
): Promise<TData> {
  let token = options?.token;

  if (!token) {
    const session = await auth();
    token = session?.b2bToken ?? undefined;
  }

  if (!token) {
    throw new B2BAuthError(
      'No B2B token available. User must be logged in with B2B Edition.',
      40101,
      [{ message: 'Missing b2bToken' }],
    );
  }

  let response: Response;
  try {
    response = await fetch(B2B_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
      body: JSON.stringify({ query: document, variables }),
      cache: 'no-store',
    });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Unknown error';
    throw new B2BGraphQLError(
      `Unable to reach the B2B API (${B2B_GRAPHQL_URL}). ${msg}. Check your network and that the host is reachable.`,
      0,
      [{ message: msg }],
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let message = `B2B GraphQL HTTP ${response.status}`;
    const details: B2BErrorDetail[] = [];
    try {
      const body = JSON.parse(text) as { errors?: B2BErrorDetail[] };
      if (body.errors?.length) {
        const first = body.errors[0];
        message = first?.message ?? message;
        details.push(...body.errors);
      } else {
        details.push({ message: text });
      }
    } catch {
      details.push({ message: text || response.statusText });
      if (text) message += `: ${text}`;
    }
    throw new B2BGraphQLError(message, response.status, details);
  }

  let json: B2BGraphQLResponse<TData>;
  try {
    json = await response.json();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON response';
    throw new B2BGraphQLError(
      `B2B API returned invalid JSON: ${msg}`,
      response.status,
      [{ message: msg }],
    );
  }

  if (json.errors?.length) {
    const firstCode = json.errors[0]?.extensions?.code;
    if (process.env.NODE_ENV === 'development') {
      console.error('[B2B GraphQL] API returned errors:', JSON.stringify(json.errors, null, 2));
      if ('data' in json && json.data != null) {
        console.error('[B2B GraphQL] Response data:', JSON.stringify(json.data, null, 2));
      }
    }

    if (firstCode === 40101) {
      throw new B2BAuthError(
        'B2B session expired. Please log in again.',
        40101,
        json.errors,
      );
    }

    throw new B2BGraphQLError(
      json.errors.map((e) => e.message).join('; '),
      firstCode ?? 0,
      json.errors,
    );
  }

  return json.data;
}

/**
 * Retrieve the current b2bToken from the session.
 * Convenience helper for components that need the token
 * without running a full query.
 */
export async function getB2BToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.b2bToken ?? undefined;
}
