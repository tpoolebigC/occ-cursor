# B2B on Catalyst: What's Possible, How to Build It, and How AI Gets You There

**Duration**: 45 minutes
**Audience**: Technical SAs and Developers
**Presenter**: Travis Poole

---

## Agenda

| # | Section | Time | Format |
|---|---------|------|--------|
| 1 | The B2B Portal Spectrum | 5 min | Slides / comparison table |
| 2 | Live Demo: Custom Portal in Catalyst | 10 min | Screen share |
| 3 | Architecture Deep Dive | 10 min | Diagrams + code |
| 4 | Known Gotchas and Platform Gaps | 5 min | Quick-ref table |
| 5 | AI-Powered Workflow: Cursor + v0 | 10 min | Live demo |
| 6 | Q&A | 5 min | Open floor |

---

## 1. The B2B Portal Spectrum (5 min)

Three tiers of B2B buyer portal on BigCommerce -- each with different trade-offs.

| | Hosted Portal | Open Source Portal | Custom Portal (Catalyst) |
|---|---|---|---|
| **What** | B2B Edition's built-in UI | Forked Next.js reference app | Built into Catalyst App Router |
| **Dev Effort** | Zero | Moderate | Significant (but AI-accelerated) |
| **Design Control** | Minimal (CSS overrides) | Moderate (React components) | Full (Tailwind + Makeswift) |
| **APIs Used** | B2B Storefront GraphQL | B2B Storefront GraphQL | B2B REST + V2/V3 Mgmt + Storefront GQL |
| **Makeswift** | No | No | Yes -- visual editing for non-devs |
| **Search** | Built-in only | Built-in only | Pluggable (Algolia, SearchSpring, etc.) |
| **Custom Features** | No | Limited | Unlimited (flooring calc, ERP sync, etc.) |
| **Best For** | Basic B2B self-service | Branded B2B with moderate budget | Enterprise merchants needing full control |

**Key message**: You don't have to choose one forever. Start with hosted, graduate to open source, build custom when the business demands it.

---

## 2. Live Demo: Custom Portal in Catalyst (10 min)

Walk through the running app at `http://localhost:3000`.

### Demo Script

1. **Login** -- show B2B token exchange in action
2. **Dashboard** -- sidebar navigation, B2B-aware header with company/address selector
3. **Orders**
   - Listing page with ERP Order # column (pulled from `extraStr1` / `external_order_id`)
   - Click into detail: line items from V2 API, shipping/billing addresses, status badges
   - Note: dates properly handle Unix timestamps from B2B API
4. **Quotes**
   - RFQ listing with numeric status code mapping (0=Draft, 1=Open, 4=Ordered, etc.)
   - Quote detail page
   - Mention: quote-to-checkout channel-scoping issue and our workaround
5. **Invoices**
   - Real B2B API data
   - Mention: channel visibility issue (invoices created on Stencil channel invisible on Catalyst)
6. **User Management**
   - Company users with roles -- real API calls, not mock data
   - Company hierarchy view
7. **Flooring Calculator** (product 152)
   - Navigate to `/en/product/152`
   - Show sqft mode: enter 500 sqft, see live price calculation ($2,995), box estimate
   - Show box mode: toggle, enter 3 boxes, see coverage info
   - Add to cart: Management API with `list_price` override + modifier stores sqft on line item
   - Open cart: verify price and "500 sqft" subtitle

---

## 3. Architecture Deep Dive (10 min)

### Data Flow

```
Browser (React)
    |
    v
Server Action (Next.js App Router)
    |
    +---> B2B REST API (/api/v3/io/...)
    |       - Orders, Quotes (RFQ), Invoices, Users, Companies
    |       - Auth: X-Auth-Token + X-Store-Hash
    |
    +---> BC Management API (V2/V3)
    |       - V2: Order details, products, shipping addresses, external_order_id
    |       - V3: Carts (list_price override), product variants, metafields
    |       - Auth: X-Auth-Token
    |
    +---> Storefront GraphQL
    |       - Products, cart, customer, addresses
    |       - Auth: Storefront Token (channel-scoped)
    |
    v
RSC Render -> Stream to Browser
```

### Authentication Flow

```
1. User logs in (email/password)
2. Storefront GraphQL LoginMutation -> customerAccessToken
3. B2B token exchange: POST /api/v3/io/auth -> b2bToken
4. Both stored in NextAuth JWT session
5. companyId resolved via GET /api/v3/io/users?bcCustomerId={id}
6. All subsequent B2B API calls scoped to companyId
```

### Key Files

| File | Purpose |
|---|---|
| `core/client/bc-management-client.ts` | V2/V3 Management API client (orders, carts, variants) |
| `core/client/b2b-client.ts` | B2B REST API client (quotes, invoices, users) |
| `core/b2b/server-actions.ts` | Server actions for enriched orders (B2B + V2 merged) |
| `core/auth/index.ts` | NextAuth config with B2B token exchange |
| `core/auth/server.ts` | Anonymous session management |
| `core/vibes/soul/sections/product-detail/flooring-calculator.tsx` | Flooring calculator component |
| `core/features/makeswift/components/` | All Makeswift-registered B2B components |

### Makeswift Integration

- B2B components registered via `runtime.registerComponent()` with configurable props
- Non-developers can drag/drop order tables, navigation, search into pages
- Props exposed: company ID, feature toggles, display options

### The MSF Requirement

- **Required** for Catalyst -- MSF flag must be enabled
- Without it: Storefront GQL ignores channel assignments, settings read from global config
- B2B Edition also requires MSF independently
- Future: auto-enabled on Catalyst channel creation (in pipeline)
- **Stencil channel NOT required for checkout** -- Catalyst handles its own redirected checkout

---

## 4. Known Gotchas and Platform Gaps (5 min)

| Issue | What Happens | Workaround |
|---|---|---|
| **Channel-scoped invoices** | Invoice created on Stencil invisible on Catalyst | Ensure invoices created on correct channel; platform fix needed |
| **Quote-to-checkout** | B2B creates cart on wrong channel -> `NotFoundError` | Use Management API `POST /v3/carts/{id}/redirect_urls` (not channel-scoped) or reassign cart channel |
| **`external_id` vs `external_order_id`** | V2 API has both; `external_id` is read-only system field | Always use `external_order_id` for ERP Order # |
| **Numeric status codes** | B2B API returns `status: 4` not `"Ordered"` | Map in code: `{0: 'Draft', 1: 'Open', 2: 'Submitted', ...}` |
| **Unix timestamps** | B2B API returns seconds since epoch, not ISO strings | Detect numeric dates, multiply by 1000 for JS `Date` |
| **No decimal quantities** | Storefront GQL `quantity` is `Int!` | Management API with `list_price` override + product modifier |
| **Deprecated `authToken`** | Old B2B server-to-server header | Use `X-Auth-Token` + `X-Store-Hash` per new docs |
| **Session corruption** | `setCartId` with no active session corrupts JWT | Create anonymous session first; try/catch on decode |

---

## 5. AI-Powered Workflow: Cursor + v0 (10 min)

### Cursor: Your AI Pair Programmer

**What it does well**:
- Reads your entire monorepo -- understands relationships between files
- Can hit APIs directly (curl) to test and debug responses
- Generates server actions from API documentation
- Iterative debugging: paste error + screenshot -> get targeted fix

**Best practices**:
- Always let it read the code before editing ("read first, edit second")
- Give full error messages + stack traces, not summaries
- Use plan mode for complex multi-file features
- Feed it API docs (paste URLs or content)
- Be specific about what you want: "add ERP order number column using V2 external_order_id"

**What we built with Cursor**:
- Entire custom buyer portal (orders, quotes, invoices, user management)
- B2B REST + V2/V3 Management API integration
- Authentication flow with B2B token exchange
- Flooring calculator with Management API cart override
- Makeswift component registration
- Stencil version of flooring calculator
- Bug fixes for 10+ runtime errors (type mismatches, module resolution, session corruption)

### v0: Rapid UI Prototyping

**What it does well**:
- Generates production-quality React + Tailwind components from descriptions
- Great for: dashboards, data tables, forms, charts, landing pages
- Outputs clean code that drops into Catalyst

**Workflow**:
1. Describe the component in v0 (be specific about layout, data, interactions)
2. Iterate in v0's preview until the UI is right
3. Copy the component into your Catalyst project
4. Wire up to server actions in Cursor

**Combined workflow**:
```
v0 (UI scaffold) -> Cursor (API integration + debugging) -> Ship
```

### Live Example

Show building a simple component:
1. Open v0, describe a "B2B order status dashboard card with status breakdown pie chart"
2. Get the component in 30 seconds
3. Show how it would drop into the Catalyst project
4. Cursor wires it to `getEnrichedOrders()` server action

---

## 6. Q&A (5 min)

### Anticipated Questions

**"Can we do this for client X?"**
Yes -- the custom portal is a repeatable pattern. The architecture is the same; you just configure it for the merchant's specific B2B needs.

**"What about Stencil?"**
The flooring calculator has a Stencil version (Handlebars + vanilla JS). B2B portal features are Catalyst-specific but the API patterns translate.

**"How long did this actually take?"**
Iteratively over several sessions. With Cursor, features that would take days take hours. The flooring calculator (end to end: product setup, Management API integration, component, server action, Makeswift registration, Stencil version) was done in a single session.

**"What's the B2B team's roadmap for channel issues?"**
Channel-scoping is a known gap. The storefront team is working on making settings/GraphQL work correctly regardless of MSF flag. B2B Edition needs to create carts on the correct channel. No firm ETA.

---

## Post-Call Resource

**Visual Cheat Sheet** -- shareable single-page reference built in v0 with:
- Portal comparison matrix
- Architecture diagram
- API quick reference
- Auth flow
- Decision tree
- Known issues table
- AI workflow tips

*(Link will be shared after the presentation)*
