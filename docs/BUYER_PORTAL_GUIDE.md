# Custom Buyer Portal – Architecture and Implementation Guide

This guide documents what’s included in our `custom-portal-project` as it relates to the custom buyer portal: how gql-tada is set up, what we still leverage from BigCommerce/Catalyst (BC), all middleware, what we built, and where things live.

## Overview
- **Framework**: Next.js (App Router)
- **Data**: BigCommerce Storefront GraphQL + B2B REST where needed
- **Type-safety**: `gql.tada` with generated schema introspection
- **UI**: Tailwind CSS, Lucide icons
- **CMS/Composition**: Makeswift components for portal widgets
- **Deployment**: Vercel (middleware-aware)

## gql-tada setup
- Entry: `core/client/graphql.ts`
  - Initializes `graphql` via `initGraphQLTada` using our BigCommerce schema introspection types.
  - Exposes `FragmentOf`, `ResultOf`, `VariablesOf`, and `readFragment` for typed queries, fragments, and variables.

```12:18:custom-portal-project/core/client/graphql.ts
export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    DateTime: string;
    Long: number;
    BigDecimal: number;
    UUID: string;
  };
  disableMasking: true;
}>();
```

- Documents and schema: `graphql.config.json`
  - Schema from `core/schema.graphql`
  - Documents under `core/client/{queries,mutations,fragments}/**/*.ts`

```1:8:custom-portal-project/graphql.config.json
{
  "schema": "core/schema.graphql",
  "documents": [
    "core/client/queries/**/*.ts",
    "core/client/mutations/**/*.ts",
    "core/client/fragments/**/*.ts"
  ]
}
```

- Usage examples across the app:
  - Data transformers and queries import `ResultOf`, `VariablesOf`, `FragmentOf` from `gql.tada` for safe types.
  - Examples:
    - `core/client/queries/get-search-results.ts`
    - `core/data-transformers/*` (e.g., `product-card-transformer.ts`, `breadcrumbs-transformer.ts`, etc.)

## What we leverage from BigCommerce/Catalyst (BC)
- **Storefront GraphQL client**: `@bigcommerce/catalyst-client` for authenticated requests and helpers.
  - Server client config: `core/client/server-client.ts` (channel, headers, Accept-Language, error handling)
  - Uses `BigCommerceAuthError`, `createClient`, and locale/channel helpers
- **Transform helpers**: `removeEdgesAndNodes` imported in transformers where convenient
- **Images/CDN config**: `core/next.config.ts` includes BigCommerce CDN domains
- **General Catalyst patterns**:
  - Server Actions + App Router layout
  - `core/app/[locale]/**` for localized storefront features

```35:79:custom-portal-project/core/client/server-client.ts
export const serverClient = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  ...
  onError: (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      console.warn('BigCommerce auth error:', error);
      return;
    }
  },
});
```

## B2B: What we built vs. what’s still BC
- We primarily use Storefront GraphQL with `gql.tada` for type-safe queries/mutations.
- For features not available in Storefront GraphQL, we use a small B2B REST client.

### Our B2B REST client
- File: `core/client/b2b-client.ts`
  - Class `B2BRestClient` encapsulates REST calls to BigCommerce B2B endpoints (e.g., quotes).
  - Methods like `getQuotes`, `getQuote`, `createQuote`, `updateQuote`, `deleteQuote`.
  - Centralized error handling (`B2BApiError`).
  - Exported instance: `b2bRestClient`.

```117:151:custom-portal-project/core/client/b2b-client.ts
throw new B2BApiError(
  `B2B REST API error: ${response.status} ${response.statusText}`,
  response.status,
);
...
async getQuote(quoteId: string) {
  return this.request(`/api/io/quotes/${quoteId}`);
}
```

### Server Actions for B2B workflows
- File: `core/b2b/server-actions.ts`
  - Wraps `b2bRestClient` for UI: `getQuotes`, `getQuote`, `createQuote`, plus address/role utilities and mock datasets for demo UX.
  - Revalidates relevant routes, e.g. on quote creation: `revalidatePath('/buyer-portal/quotes')`.

```209:222:custom-portal-project/core/b2b/server-actions.ts
export async function createQuote(input: any) {
  try {
    const data = await b2bRestClient.createQuote(input);
    revalidatePath('/buyer-portal/quotes');
    return { quote: (data as any)?.data, error: null };
  } catch (error) {
    ...
  }
}
```

## Middleware chain
- Entry: `core/middleware.ts` using a composed middleware pipeline.
- Matchers exclude static, admin, sitemap, and `buyer-portal` paths (buyer portal routes don’t need locale prefix).
- Order of middlewares:
  1. `withAuth`
  2. `withMakeswift`
  3. `withIntl`
  4. `withAnalyticsCookies`
  5. `withChannelId`
  6. `withB2B`
  7. `withRoutes`

```10:18:custom-portal-project/core/middleware.ts
export const middleware = composeMiddlewares(
  withAuth,
  withMakeswift,
  withIntl,
  withAnalyticsCookies,
  withChannelId,
  withB2B,
  withRoutes,
);
```

- Middleware sources: `core/middlewares/*`
  - `compose-middlewares.ts`: helper to chain middlewares
  - `with-auth.ts`: authentication gate, session context
  - `with-makeswift.ts`: Makeswift runtime wiring
  - `with-intl.ts`: locale handling
  - `with-analytics-cookies.ts`: analytics cookie setup
  - `with-channel-id.ts`: injects channel context
  - `with-b2b.ts`: adds B2B context/guards
  - `with-routes.ts`: route rewrites/guards as needed

## Custom Buyer Portal (Our build)
- Route namespace: `/custom-buyer-portal/**`
- Location: `core/app/custom-buyer-portal`
  - `layout.tsx`: Sidebar layout, navigation, content shell
  - `customers/page.tsx`: Customer management UI (mock data for demo)
  - `analytics/page.tsx`: Analytics dashboard UI (mock metrics/charts)
  - README with full demo notes and roadmap

```6:13:custom-portal-project/core/app/custom-buyer-portal/layout.tsx
const navigation = [
  { name: 'Dashboard', href: '/custom-buyer-portal', icon: BarChart3 },
  { name: 'Customers', href: '/custom-buyer-portal/customers', icon: Users },
  { name: 'Orders', href: '/custom-buyer-portal/orders', icon: ShoppingCart },
  { name: 'Quotes', href: '/custom-buyer-portal/quotes', icon: FileText },
  { name: 'Analytics', href: '/custom-buyer-portal/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/custom-buyer-portal/settings', icon: Settings },
];
```

### Makeswift buyer-portal components
- Located under `core/features/makeswift/components/buyer-portal/*`
  - Components registered with types like `buyer-portal/catalog-grid`, `buyer-portal/order-list`, etc.
  - These wire UI widgets used in portal pages and can be composed in CMS.

Examples:
- `buyer-portal/b2b-navigation.makeswift.tsx`
- `buyer-portal/user-management-dashboard.makeswift.tsx`
- `buyer-portal/company-hierarchy.makeswift.tsx`

## File map (high level)
- `core/client/graphql.ts`: gql-tada init and exports
- `core/client/server-client.ts`: BigCommerce client configuration (server)
- `core/client/b2b-client.ts`: B2B REST client for unsupported GraphQL features
- `core/b2b/server-actions.ts`: Server actions wrapping REST + UI models
- `core/middleware.ts`: Composed middleware entry; see `core/middlewares/*`
- `core/app/custom-buyer-portal/**`: Custom portal routes and layout
- `core/features/makeswift/components/buyer-portal/**`: CMS-registered widgets
- `core/data-transformers/**`: Typed mappers using `gql.tada` results
- `core/next.config.ts`: Images (Makeswift + BC), trailingSlash, etc.

## How data flows
1. UI requests page (App Router)
2. Middleware applies auth/intl/channel/B2B context
3. Server components/actions fetch via:
   - `gql.tada` typed queries (Storefront GraphQL) using Catalyst client
   - B2B REST client for quotes/addresses where GraphQL lacks coverage
4. Transformers map GraphQL/REST payloads to UI-friendly shapes
5. Makeswift widgets render typed data where configured

## Environment and deployment
- Required environment variables include BC storefront token, store hash, channel id; B2B API host/token when using REST features.
- Vercel deployment supports middleware; ensure `vercel.json` aligns with Next.js version/middleware config.
- Images allow-listed for Makeswift and BigCommerce CDN in `core/next.config.ts`.

## Presenting to the team
- Start with `/custom-buyer-portal` to show our custom shell and widgets
- Highlight typed data via gql-tada and how it improves DX and safety
- Show B2B workflows (quotes) flowing through server actions to REST
- Call out middleware chain for auth/intl/channel/B2B concerns
- Contrast with embedded `/buyer-portal` where appropriate

## Next steps (optionally)
- Replace demo data with live GraphQL/REST calls in portal pages
- Expand Makeswift widgets for additional B2B features
- Add API routes for complex operations requiring server-only secrets
- Tighten auth/role gates in `with-b2b` and server actions

## Setup and scripts

- Root scripts (`package.json`):
  - `dev`: runs Turbo dev with `.env.local`
  - `build`: Turbo build with `.env.local`
  - `lint`, `test`, `typecheck`
- App scripts (`core/package.json`):
  - `dev`: `npm run generate && next dev`
  - `generate`: GraphQL schema/codegen via `core/scripts/generate.cjs`
  - `build`: `npm run generate && next build`
  - `lint`, `typecheck`

```1:14:custom-portal-project/core/package.json
{
  "scripts": {
    "dev": "npm run generate && next dev",
    "generate": "dotenv -e .env.local -- node ./scripts/generate.cjs",
    "build": "npm run generate && next build",
    "build:analyze": "ANALYZE=true npm run build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

### GraphQL code generation
- Script: `core/scripts/generate.cjs`
  - Downloads BigCommerce Storefront GraphQL schema to `core/bigcommerce.graphql`
  - Runs `@gql.tada/cli-utils` to generate typed artifacts
- Requires env vars: `BIGCOMMERCE_STORE_HASH`, `BIGCOMMERCE_STOREFRONT_TOKEN`, optional `BIGCOMMERCE_CHANNEL_ID`.

```1:20:custom-portal-project/core/scripts/generate.cjs
const graphqlApiDomain = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';
...
await generateSchema({
  input: getEndpoint(),
  headers: { Authorization: `Bearer ${getToken()}` },
  output: join(__dirname, '../bigcommerce.graphql'),
});
```

## Middleware deep dive

- Entry: `core/middleware.ts` (compose pattern). Matchers exclude `api`, `_next/*`, `admin`, `sitemap`, `robots.txt`, `buyer-portal` (embedded portal has no locale prefix).
- Chain order and responsibilities:
  - `withAuth`: anonymous session bootstrap, login redirects for protected routes; B2B token-aware exceptions for embedded portal.
  - `withMakeswift`: initializes Makeswift runtime for CMS-driven components.
  - `withIntl`: locale detection and headers.
  - `withAnalyticsCookies`: sets analytics cookies.
  - `withChannelId`: infers channel from locale and injects into requests.
  - `withB2B`: light B2B routing tweaks; allows embedded portal entry.
  - `withRoutes`: final rewrites/guards.

```1:44:custom-portal-project/core/middlewares/with-auth.ts
const protectedPathPattern = new URLPattern({ pathname: `{/:locale}?/(account)/*` });
...
if (isProtectedRoute && isGetRequest && !customerAccessToken && !hasB2BToken && !isHomepageWithSection) {
  return redirectToLogin(req.url);
}
```

```6:37:custom-portal-project/core/middlewares/with-b2b.ts
if (
  request.auth?.b2bToken &&
  request.nextUrl.pathname.startsWith('/account/')
) {
  return NextResponse.redirect(new URL('/?section=orders', request.url));
}
```

## Embedded vs. Custom Buyer Portal

- Embedded portal: `/buyer-portal/**`
  - Layout and shell: `core/app/buyer-portal/layout.tsx`, `components/buyer-portal-{header,sidebar}.tsx`
  - Navigation links: orders, quotes, catalog, account, analytics

```14:21:custom-portal-project/core/app/buyer-portal/components/buyer-portal-sidebar.tsx
const navigation = [
  { name: 'Dashboard', href: '/buyer-portal', icon: Home },
  { name: 'Orders', href: '/buyer-portal/orders', icon: ShoppingBag },
  { name: 'Quotes', href: '/buyer-portal/quotes', icon: FileText },
  { name: 'Catalog', href: '/buyer-portal/catalog', icon: Package },
  { name: 'Account', href: '/buyer-portal/account', icon: User },
  { name: 'Analytics', href: '/buyer-portal/analytics', icon: BarChart3 },
];
```

- Custom portal: `/custom-buyer-portal/**`
  - Layout: `core/app/custom-buyer-portal/layout.tsx`
  - Pages: `customers/page.tsx`, `analytics/page.tsx` (+ placeholders listed in README)
  - Intent: showcase full-control UX separate from embedded surface

## Algolia search integration

- Feature flags and config: `core/lib/b2b/config.ts`
  - Validates `ALGOLIA_APP_ID`, `ALGOLIA_SEARCH_KEY`, `ALGOLIA_INDEX_NAME`
  - `featureFlags.ENABLE_ALGOLIA_SEARCH` toggles behavior
- Header quick search uses Algolia server action:

```57:77:custom-portal-project/core/components/header/_actions/search.ts
const algoliaResults = await algoliaClient.searchSingleIndex<AlgoliaHit>({
  indexName: process.env.ALGOLIA_INDEX_NAME,
  searchParams: { query: submission.value.term, filters: 'is_visible:true' },
});
```

- Product quick search helper processes price fields robustly:

```92:129:custom-portal-project/core/client/queries/get-search-results.ts
const algoliaResults = await searchSingleIndex<AlgoliaHit>({ indexName: process.env.ALGOLIA_INDEX_NAME || '', searchParams: { query: searchTerm, hitsPerPage: 5 } });
const products = algoliaResults.hits.map(hit => {
  let priceValue = 0;
  if (hit.default_price !== undefined) { priceValue = typeof hit.default_price === 'string' ? parseFloat(hit.default_price) || 0 : Number(hit.default_price) || 0; }
  else if (hit.prices?.price && 'value' in hit.prices.price) { priceValue = Number((hit.prices.price as any).value) || 0; }
  else if (hit.prices?.USD) { priceValue = Number(hit.prices['USD']) || 0; }
  ...
});
```

- B2B dashboard search helpers call `searchAlgoliaProducts` with GraphQL fallback if env isn’t set (`core/b2b/server-actions.ts`).

## B2B authentication and user context

- Manager: `core/b2b/utils/b2bAuthManager.ts`
  - Initializes from session via `auth()` and a `gql.tada` query to `customer` to infer B2B-ness (company/group).
  - Builds `B2BUserContext` (roles, permissions, company info, tokens) and exposes helpers.

```200:263:custom-portal-project/core/b2b/utils/b2bAuthManager.ts
const response = await client.fetch({ document: GET_CUSTOMER_INFO, customerAccessToken: session.user.customerAccessToken, fetchOptions: { cache: 'no-store' } });
const isB2BUser = !!customer.company || customer.customerGroupId !== undefined;
...
return { isAuthenticated: true, isInitialized: true, userContext, error: null, source: 'API', isLoading: false };
```

## B2B data access pattern

- Prefer Storefront GraphQL via `gql.tada` for read flows:
  - Examples in `core/b2b/client/b2b-graphql-client.ts` (customer info, orders, etc.)
- Use REST for unsupported B2B features (quotes/shopping lists placeholders, addresses where needed):
  - Client: `core/client/b2b-client.ts` with `B2BRestClient`
  - UI-facing wrappers: `core/b2b/server-actions.ts` (revalidation + mapping)

```144:156:custom-portal-project/core/client/b2b-client.ts
const endpoint = companyId ? `/api/io/companies/${companyId}/quotes` : '/api/io/quotes';
return this.request(endpoint);
```

## Next.js and Vercel config

- `core/next.config.ts` fetches store settings at build-time and injects image domains; enables PPR, compression, headers.

```98:110:custom-portal-project/core/next.config.ts
images: {
  domains: [ 'storage.googleapis.com', ...settings.urls.cdnUrls.map(url => url.replace('https://', '').replace('http://', '')) ],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 2592000,
},
```

- `core/vercel.json` sets function timeouts, security headers, rewrites, and caching headers for static assets.

## Environment variables

Required for GraphQL codegen and runtime:
- `BIGCOMMERCE_STORE_HASH`
- `BIGCOMMERCE_STOREFRONT_TOKEN`
- `BIGCOMMERCE_CHANNEL_ID` (optional but recommended)

B2B / REST (when used):
- `B2B_API_HOST`, `B2B_STOREFRONT_API_HOST`
- `B2B_API_TOKEN` or `B2B_CLIENT_ID`/`B2B_CLIENT_SECRET`

Algolia:
- `ALGOLIA_APP_ID`, `ALGOLIA_SEARCH_KEY`, `ALGOLIA_INDEX_NAME` (and optional `ALGOLIA_ADMIN_KEY`)

## Data flow diagram

```mermaid
flowchart TD
A[Request /buyer-portal or /custom-buyer-portal] --> B[Middleware chain
Auth → Makeswift → Intl → Analytics → Channel → B2B → Routes]
B --> C[Server Actions / Server Components]
C -->|GraphQL (typed via gql.tada)| D[BigCommerce Storefront GraphQL]
C -->|REST (B2B-only features)| E[BigCommerce B2B REST]
D --> F[Transformers map to UI shapes]
E --> F
F --> G[Components / Makeswift Widgets]
```

## File reference index (selected)
- `core/client/graphql.ts`: `gql.tada` init and types
- `core/scripts/generate.cjs`: GraphQL schema/codegen
- `core/client/server-client.ts`: Storefront client, channel/locale headers
- `core/client/b2b-client.ts`: B2B REST client
- `core/b2b/server-actions.ts`: B2B UI server actions
- `core/b2b/utils/b2bAuthManager.ts`: B2B auth/context
- `core/middleware.ts` + `core/middlewares/*`: request pipeline
- `core/app/buyer-portal/**`: embedded portal
- `core/app/custom-buyer-portal/**`: custom portal
- `core/features/makeswift/components/buyer-portal/**`: Makeswift widgets
- `core/client/queries/get-search-results.ts`, `core/components/header/_actions/search.ts`: Algolia usage
- `core/next.config.ts`, `core/vercel.json`: platform config

---

## Page-by-page mapping (routes → data → actions → transformers)

- Embedded portal (`/buyer-portal/**`)
  - `/buyer-portal` (Dashboard)
    - Layout: `core/app/buyer-portal/layout.tsx`
    - Shell: `components/buyer-portal-{header,sidebar}.tsx`
    - Widgets: Makeswift buyer-portal components (see registry under `core/features/makeswift/components/buyer-portal/*`)
    - Data: composed from server actions or GraphQL queries used inside widget implementations
  - `/buyer-portal/orders`
    - Data: `GET_ORDERS` GraphQL in `core/b2b/client/b2b-graphql-client.ts` (customer.orders)
    - Access: B2B user context available; `with-auth` permits embedded route access
  - `/buyer-portal/quotes`
    - Data: `b2bRestClient.getQuotes()` via `core/b2b/server-actions.ts`
    - Actions: `createQuote`, `getQuote`, potential `update/delete` when enabled
    - Revalidation: `revalidatePath('/buyer-portal/quotes')` after create
  - `/buyer-portal/catalog`
    - Data: Algolia search for discovery (`core/client/queries/get-search-results.ts`) and/or Storefront GraphQL for PDP/PLP
    - Transformers: `core/data-transformers/algolia-search-results-transformer.ts` (and related)
  - `/buyer-portal/account`
    - Data: `GET_CUSTOMER_INFO` GraphQL in `core/b2b/client/b2b-graphql-client.ts`
    - Actions: address ops via server-actions (REST placeholders for unsupported GraphQL mutations)
  - `/buyer-portal/analytics`
    - Data: composed widgets (custom metrics; some mock for demo)

- Custom portal (`/custom-buyer-portal/**`)
  - `/custom-buyer-portal` (Dashboard)
    - Layout: `core/app/custom-buyer-portal/layout.tsx`
    - Widgets: Makeswift components (buyer-portal quick actions, metrics)
    - Data: server actions in `core/b2b/server-actions.ts` + Algolia search helpers
  - `/custom-buyer-portal/customers`
    - Current: UI with demo data
    - Future: `GET_CUSTOMER_INFO` and B2B user-management client
  - `/custom-buyer-portal/analytics`
    - Current: UI with demo metrics
    - Future: real analytics sources (orders aggregation, product performance)

- Locale dashboard routes (`/app/[locale]/(default)/custom-dashboard/**`)
  - Quick Order: `quick-order/page.tsx`
    - Search: `searchAlgoliaProducts` in `core/b2b/server-actions.ts` with GraphQL fallback
    - Cart ops: `core/b2b/services/cartService.ts` (gql-tada based)
  - Addresses: `addresses/page.tsx`
    - Data/actions: `getAddresses`, `createAddress`, `updateAddress`, `deleteAddress` (server-actions) with REST placeholders where GraphQL lacks coverage
  - Shopping lists: `shopping-lists/page.tsx`
    - Data/actions: `getShoppingLists`, `getShoppingListDetails`, `create/update/delete` (placeholders in GraphQL client with notes)

### Transformers used in pages
- `core/data-transformers/*` map GraphQL/Algolia output to UI-friendly shapes.
  - Product card, breadcrumbs, prices, form fields, page info, logo, search results.

---

## B2B permissions matrix and access control examples

- Roles (`core/b2b/utils/b2bAuthManager.ts`): `CustomerRole` with typical hierarchy (ADMIN, SENIOR_BUYER, JUNIOR_BUYER, etc.) and computed default permissions.
- Permissions model: `{ code: string; permissionLevel: number }` with level checks.
- Example permission codes: `orders`, `quotes`, `invoices`, `quick_order`, `shopping_lists`, `addresses`.

### Matrix (example defaults)
- ADMIN: all features at level 3
- SENIOR_BUYER: orders/quotes/shopping_lists at level 3/3/2
- JUNIOR_BUYER: limited levels per feature
- B2C: mostly level 0–1

```200:263:custom-portal-project/core/b2b/utils/b2bAuthManager.ts
const isB2BUser = !!customer.company || customer.customerGroupId !== undefined;
...
permissions: this.getDefaultPermissions(isB2BUser),
```

### Access control helpers
- `hasB2BPermission(code: string, level: number)` → boolean
- `isB2BUser()`, `getB2BCompanyInfo()`

Usage example (component-level gate):

```ts
import { hasB2BPermission } from '~/b2b/utils/b2bAuthManager';

if (!hasB2BPermission('quotes', 2)) {
  return <NoAccess />;
}
```

### Middleware interplay
- `with-auth`: permits embedded portal access for B2B (“section” param on homepage) even without customerAccessToken; protects `/account` unless B2B embedded context applies.
- `with-b2b`: redirects `/account/*` for B2B users to embedded portal section.

---

## What’s left to build (backlog)

- Data wiring for custom portal pages
  - Customers page: connect to B2B user-management client (`core/b2b/client/user-management-client.ts` or `b2b-user-management.ts`) and surface CRUD flows
  - Analytics page: real metrics sourced from orders, quotes, products; server actions + caching
  - Orders/Quotes pages in custom portal: wire to GraphQL (orders) and REST (quotes) with pagination and detail views

- Quotes end-to-end
  - Enhance `b2bRestClient` with update/delete endpoints and error normalization
  - Add server actions for update/delete + optimistic UI patterns
  - Integrate permissions checks (e.g., only ADMIN/SENIOR_BUYER can approve)

- Addresses and account management
  - If Storefront GraphQL lacks certain mutations, build API routes that call REST
  - Implement set-default and delete address flows where needed

- Shopping lists
  - Replace placeholders in `core/b2b/client/b2b-graphql-client.ts` with real API calls if/when available, or wire up REST fallback
  - Build create/update/delete + share/collaboration flows

- Algolia integration enhancements
  - Re-enable direct Algolia search in `searchAlgoliaProducts` once import issues resolved
  - Add facets, synonyms, query rules; improve price extraction logic
  - Add ISR caching for common queries

- Authorization & auditing
  - Centralize per-route permission checks (HOF or middleware) for `buyer-portal` and `custom-buyer-portal`
  - Add audit logs for sensitive mutations (quotes, user changes)

- UX polish
  - Loading and empty states for all pages
  - Error boundaries for server actions
  - Responsive and accessibility passes

- Testing & performance
  - Playwright flows for key journeys (login, view orders, create quote)
  - Lighthouse/Unlighthouse checks; image optimization validation
  - API latency logging and retries/backoff in clients

- Deployment & operations
  - CORS documentation for OCC/BC endpoints (if proxied)
  - Secrets management for Algolia and B2B credentials on Vercel
  - Observability (logs/metrics) for server actions

---

If you want, I can next add per-page “call tree” diagrams and a permissions-by-route table to make team onboarding even faster.
