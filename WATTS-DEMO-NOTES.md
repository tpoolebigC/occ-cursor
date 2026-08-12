# Watts Demo Bench — notes & repo updates needed (2026-08-12)

## New in this branch (`watts-demo-bench`)

- **`/watts-demo`** page — API test bench for the 8/13 Watts tech deep dive. Buttons fire real B2B **Management V3** calls server-side and render the full request→response exchange (token redacted). Doubles as the verbose-logging demo (agenda row 3).
- `core/b2b/management-client.ts` — Management V3 client using the **current** auth scheme: `X-Auth-Token` + `X-Store-Hash` (legacy `authToken` header deprecated 2025-09-30; do not mix the two).
- `core/app/api/watts-demo/route.ts` — case runner: book-of-business quotes/orders/invoices, super admins + assignments, companies, quote detail + lifecycle facts.

Uses existing env vars: `B2B_API_TOKEN` (must be a store-level V3 token with B2B Edition scope = modify for the new headers), `BIGCOMMERCE_STORE_HASH`, `B2B_API_HOST`.

## Updates this repo needs (from the B2B/OpenAPI verification work, SA Confluence doc set 2026-08)

1. **`core/b2b/client.ts` (and `core/features/b2b/services/client.ts`) use the legacy `authToken` header** on `api-b2b` calls. Migrate to `X-Auth-Token` + `X-Store-Hash` (deprecation effective 2025-09-30). Note: never send legacy `authToken` together with `X-Store-Hash` — the combination misbehaves.
2. **`core/app/api/b2b/quotes/stats/route.ts` calls a nonexistent endpoint** — `api.bigcommerce.com/stores/{hash}/v3/b2b/quotes` is not a real API — and silently serves mock data on failure. Real endpoint: `https://api-b2b.bigcommerce.com/api/v3/io/rfq`. Also it sends the *customer access token* as `X-Auth-Token`, which is the wrong credential class for a Management call. Rework on the pattern in `core/b2b/management-client.ts`.
3. **Quote lifecycle assumptions**: anywhere the app assumes API-created quotes can be drafts — they can't. `POST /rfq` auto-submits; `PUT /rfq/{id}` documents only `"archived"` as a writable status; no draft→submitted transition exists. Approval workflows must gate before quote creation.
4. **Env naming drift**: this repo uses `B2B_API_TOKEN`/`B2B_API_HOST` (2025-era guide); the official Catalyst B2B integration (`@bigcommerce/catalyst-b2b-makeswift`, current at 1.10.0) uses `BIGCOMMERCE_ACCESS_TOKEN` + `B2B_API_HOST` + `LOCAL_BUYER_PORTAL_HOST`/`PROD_BUYER_PORTAL_BASE_URL`. Align when rebasing onto the official scaffold — which is now the recommended starting point (the old "official branches are incomplete" advice is obsolete; the integration was updated to Catalyst 1.10 in late July 2026 after the unified-GraphQL breakage was fixed).
5. **Quote status enum** for any UI filtering: 0 New, 2 In Process, 3 Updated by customer, 4 Ordered, 5 Expired, 6 Archived, 7 Draft (staff-side). (The old stats route filters on invented string statuses like `pending`/`approved`.)

## References

- OpenAPI specs index: https://docs.bigcommerce.com/developer/api-reference/openapi-specifications
- B2B Management V3 spec: https://docs.bigcommerce.com/openapi/b2b-management.json
- SA Confluence: B2B Buyer Portal doc set under "Catalyst + Makeswift + B2B Buyer Portal on Vercel" (page 1857355941) — API surface, customization recipe, masquerade/company-switching internals, pricing chain, third-party search.
