# v0 Prompt: B2B on Catalyst Interactive Learning Module

Copy the prompt below into v0.dev to generate the interactive learning module. This is designed to be deployed to Vercel as a standalone reference app after the brown bag presentation.

---

## Prompt

Create a multi-page interactive learning module React app called `B2BCatalystGuide`. This is a comprehensive, visually polished reference for BigCommerce B2B on Catalyst. It will be deployed to Vercel as a standalone learning resource for technical SAs and developers.

Use a dark theme (slate-900/zinc-900 background, white/gray text, accent colors for sections). Make it responsive and printable. Use Tailwind CSS and shadcn/ui components (Tabs, Card, Badge, Table, Accordion, Tooltip, Button, Separator). Use lucide-react for icons.

The app should have a sticky header navigation with the app title "B2B on Catalyst" and navigation tabs for each section. Use URL hash routing or a tabs-based layout so each section is directly linkable. Include a progress indicator showing which sections have been viewed (use localStorage).

---

### Section 1: Portal Comparison (blue accent, icon: LayoutGrid)

A 3-column comparison table with these rows:
- Row headers: Dev Effort, Design Control, APIs Used, Makeswift Support, Custom Features, Search, Best For
- Column 1: "Hosted Portal" -- Zero, Minimal (CSS only), B2B Storefront GQL, No, No, Built-in only, Basic B2B self-service
- Column 2: "Open Source Portal" -- Moderate, Moderate (React), B2B Storefront GQL, No, Limited, Built-in only, Branded B2B UX
- Column 3: "Custom Portal (Catalyst)" -- Significant (AI-accelerated), Full (Tailwind + Makeswift), B2B REST + V2/V3 Mgmt + Storefront GQL, Yes, Unlimited, Pluggable (Algolia, SearchSpring, etc.), Enterprise full control

Use badges/chips for the "Best For" row. Highlight the Custom Portal column with a subtle green border glow.

Below the table, add a callout card: "You don't have to choose one forever. Start with hosted, graduate to open source, build custom when the business demands it."

---

### Section 2: Architecture Diagram (green accent, icon: GitBranch)

A visual flow diagram using styled boxes and arrows (CSS/Tailwind, not an image):
- Left: "Browser (React)" box
- Center: "Next.js Server Actions" box (larger, emphasized)
- Right: Three stacked boxes:
  - "B2B REST API" with endpoints: /orders, /rfq, /invoices, /users
  - "BC Management API (V2/V3)" with: orders, carts, variants, metafields
  - "Storefront GraphQL" with: products, cart, customer, addresses
- Arrows connecting left -> center -> right
- Below center: "Auth: NextAuth JWT + B2B Token + customerAccessToken"

Add an interactive tooltip on each API box that shows 2-3 key characteristics when hovered.

---

### Section 3: Authentication Flow (purple accent, icon: Shield)

A horizontal step flow with 6 numbered steps:
1. User logs in (email/password)
2. Storefront GQL LoginMutation -> customerAccessToken
3. B2B token exchange: POST /api/v3/io/auth -> b2bToken
4. Both tokens stored in NextAuth JWT session
5. companyId resolved via GET /api/v3/io/users
6. All B2B API calls scoped to companyId

Use connected circles/badges for each step with a line between them. Make each step clickable to expand a brief explanation (use Accordion or a toggle).

---

### Section 4: Channel-Scoping Deep Dive (amber accent, icon: AlertTriangle)

This is a critical section explaining one of the most confusing and impactful architectural constraints in B2B on Catalyst.

**Title**: "Why Channel-Scoping Breaks Everything (and How to Fix It)"

**Intro paragraph** (styled as a warning callout):
"When a store has Multi-Storefront (MSF) enabled, BigCommerce data becomes channel-scoped. This means data created on one channel may be invisible from another. This is the #1 source of bugs and confusion in B2B on Catalyst."

**Sub-section 4a: What Is Channel-Scoping?**
A simple diagram showing:
- Channel 1 (Stencil/Default) -- has its own: products, categories, cart sessions, checkout settings, storefront GraphQL data
- Channel 2 (Catalyst) -- separate: products, categories, cart sessions, checkout settings, storefront GraphQL data
- B2B Control Panel -- creates data (quotes, invoices, orders) that may be associated with a specific channel
- Management API (X-Auth-Token) -- sees everything across all channels (NOT channel-scoped)

Use two colored boxes side by side with a dividing line, showing what each channel can see.

**Sub-section 4b: Real-World Failures We Found**
An interactive accordion or expandable cards for each failure:

1. **Quote Visibility Mismatch**
   - Symptom: A quote created in the B2B control panel shows up in the Stencil hosted buyer portal and our custom portal, but NOT in the open source buyer portal (freshstart).
   - Root cause: The hosted buyer portal uses the B2B Storefront API (channel-scoped). The open source portal also uses the B2B Storefront API via the headless SDK (`window.b2b`), authenticated with a JWT for the Catalyst channel. If the quote was created under the Stencil channel, the Catalyst channel's Storefront API simply doesn't return it.
   - Why our custom portal sees it: We use the B2B REST Management API (`X-Auth-Token` server-to-server), which is NOT channel-scoped. It returns all quotes for the company regardless of channel.
   - Visual: Show a table with three rows: Stencil Portal -> channel-scoped -> YES sees quote | Open Source Portal (Catalyst channel) -> channel-scoped -> NO | Custom Portal (Management API) -> not channel-scoped -> YES

2. **Invoice Invisibility**
   - Symptom: Invoices created on the Stencil channel don't appear when fetched via Storefront GQL on the Catalyst channel.
   - Root cause: Same channel-scoping issue. The Storefront GQL invoice queries are scoped to the current channel.
   - Fix: Use the B2B Management API for invoice listing, or ensure invoices are created against the correct channel.

3. **Quote-to-Checkout Failure**
   - Symptom: "Proceed to Checkout" on a quote generates a cart URL, but navigating to it returns a NotFoundError on the Catalyst storefront.
   - Root cause: The checkout URL is generated for the channel the quote is associated with. If the quote belongs to Channel 1 (Stencil) but the user is on Channel 2 (Catalyst), the cart/checkout session is invisible.
   - Workaround: Use Management API `POST /rfq/{id}/checkout` and then use Management API cart redirect URLs (which are not channel-scoped), OR reassign the quote's channelId before checkout.

4. **Quote Status Code Confusion**
   - Symptom: A quote shows as "Ordered" in one portal but "Open" / "In Process" in another.
   - Root cause: The B2B API returns numeric status codes. Our initial mapping was completely wrong -- we guessed the codes instead of checking the docs.
   - Show a comparison table:

   | Status ID | What We Had (WRONG) | Actual Meaning (from API docs) |
   |-----------|--------------------|-----------------------------|
   | 0 | Draft | New |
   | 1 | Open | (does not exist) |
   | 2 | Ordered | In Process |
   | 3 | Expired | Updated by Customer |
   | 4 | Ordered | Ordered |
   | 5 | Open | Expired |
   | 6 | (missing) | Archived |
   | 7 | (missing) | Draft |

   Highlight wrong cells in red, correct cells in green. Add a link: "Always check: developer.bigcommerce.com/b2b-edition/apis/rest-management/quote"

**Sub-section 4c: The MSF Requirement**
A timeline or info-panel explaining:
- MSF flag (`Feature_MSF=true`) is required for Catalyst stores -- even for single-channel use
- Without MSF: Storefront GQL ignores channel product assignments, reads settings from global config instead of channel config, checkout settings don't apply properly
- Current state: Merchants must manually enable MSF through an eligibility check
- Future state: MSF will be auto-enabled when creating a Catalyst channel
- Key clarification: "MSF required" does NOT mean "second storefront required." Merchants can disable Channel 1 (Stencil) and only use the Catalyst channel. They don't need to pay for a second storefront seat.
- Use a green callout box: "MSF = a configuration flag, not a billing decision. Enable it, disable Channel 1 if you want, and you're good."

**Sub-section 4d: The Fix -- Management API as the Equalizer**
A summary card showing:
- Problem: Channel-scoped Storefront APIs create blind spots in B2B data
- Solution: Use the B2B REST Management API for all B2B data operations (quotes, orders, invoices, shopping lists, users)
- Trade-off: Requires server-side implementation (Next.js Server Actions), but gives you a unified view across all channels
- Show a simple before/after diagram:
  - Before: Browser -> B2B SDK (channel-scoped) -> partial data
  - After: Browser -> Server Actions -> Management API (all data) -> complete picture

---

### Section 5: API Quick Reference (orange accent, icon: Database)

A compact, sortable table with these columns: API, Base URL, Auth Header, Key Endpoints, Gotcha
Rows:
- B2B REST | api-b2b.bigcommerce.com | X-Auth-Token + X-Store-Hash | /api/v3/io/orders, /rfq, /invoices, /users | Numeric status codes, Unix timestamps, NOT channel-scoped
- BC V2 Mgmt | api.bigcommerce.com/stores/{hash} | X-Auth-Token | /v2/orders, /v2/orders/{id}/products | external_id is NOT writable, use external_order_id for ERP #
- BC V3 Mgmt | api.bigcommerce.com/stores/{hash} | X-Auth-Token | /v3/carts (list_price override), /v3/catalog/products | Cart channel_id matters for Storefront GQL visibility
- Storefront GQL | {channel}.mybigcommerce.com/graphql | Bearer {storefrontToken} | products, cart, customer | quantity is Int! (no decimals), CHANNEL-SCOPED

Use monospace font for endpoints. Color the "Gotcha" column in amber/warning. Make the "CHANNEL-SCOPED" gotcha on Storefront GQL a bold red badge to reinforce the lesson from Section 4.

Add a clickable row that expands to show an example curl/fetch for each API.

---

### Section 6: Decision Tree (teal accent, icon: GitFork)

An interactive flowchart for "Which portal should I recommend?":
- Start: "Does the merchant need custom UI?"
  - No -> "Hosted Portal" (show green badge: easiest)
  - Yes -> "Do they need Makeswift visual editing?"
    - No -> "Open Source Portal" (show blue badge: moderate effort)
    - Yes -> "Do they need custom features (decimal qty, ERP sync, pluggable search)?"
      - No -> "Open Source Portal + custom CSS"
      - Yes -> "Custom Portal in Catalyst" (show purple badge: most powerful)

Make each node clickable. When clicked, show a tooltip with 1-2 sentences of reasoning.

Below the tree, add a second mini decision tree: "Does the merchant need B2B on Catalyst?"
- Start: "Is MSF enabled?"
  - No -> "Enable MSF first (no extra cost if disabling Channel 1)"
  - Yes -> "Is the B2B data appearing correctly?"
    - No -> "Check channel-scoping (see Section 4)"
    - Yes -> "You're good! Choose your portal tier above."

---

### Section 7: Known Issues & Workarounds (red accent, icon: Bug)

A compact, filterable table with severity indicators:
| Severity | Issue | Impact | Workaround | Status |
| Critical | Channel-scoped invoices | Invisible on wrong channel | Management API for invoice listing | Platform limitation |
| Critical | Quote-to-checkout cross-channel | Cart NotFoundError | Mgmt API redirect_urls or reassign channel | Platform limitation |
| High | Quote status code mismatch | Wrong status labels displayed | Use official status map from API docs | Fixed in our code |
| High | external_id confusion | Wrong field, read-only | Use external_order_id for ERP # | Documentation gap |
| High | No decimal quantities in GQL | Can't sell by sqft/meter | Mgmt API list_price override + text modifier | Architectural workaround |
| Medium | Deprecated authToken | Server-to-server auth breaks | Migrate to X-Auth-Token + X-Store-Hash | Migration required by 2025 |
| Medium | MSF flag required | Products/settings wrong without it | Enable MSF; will be auto-enabled in future | Planned fix |
| Low | Session cookie corruption | Site-wide JSON.parse errors | Resilient JWT decode + auto-clear corrupt cookies | Fixed in our code |

Use red/amber/yellow severity badges. Add a filter dropdown for severity level.

---

### Section 8: AI Workflow (indigo accent, icon: Sparkles)

Two side-by-side interactive cards:

Card 1: "Cursor" (icon: Terminal)
- Use for: API integration, debugging, architecture, server actions, multi-file refactors
- Tips (as a bulleted list):
  - "Always let it read the code first before editing"
  - "Paste full errors + screenshots -- context is king"
  - "Use plan mode for complex features"
  - "Feed it API docs and Slack threads for domain context"
  - "Don't fight it -- iterate. If it breaks something, give it the error and let it fix"
- Real example: "Built the entire flooring calculator (server action, client component, Makeswift registration, Stencil port) in one session"

Card 2: "v0" (icon: Paintbrush)
- Use for: UI scaffolding, dashboards, tables, forms, data visualization, cheat sheets (like this one!)
- Tips:
  - "Be extremely specific about layout and content"
  - "Iterate in preview before copying code"
  - "Use it for prototyping, then wire up real data in Cursor"
  - "Great for generating complex Tailwind layouts you'd spend hours on manually"
- Real example: "This interactive learning module was generated in v0 and deployed to Vercel"

Below both cards, a workflow arrow: v0 (UI Prototype) -> Cursor (Integration + APIs) -> Vercel (Deploy) -> Ship

---

### Section 9: Key File Reference (gray accent, icon: FolderTree)

A collapsible file tree showing the custom portal project structure with annotations:

```
custom-portal-project/core/
├── app/[locale]/(default)/
│   ├── custom-dashboard/           # B2B buyer portal pages
│   │   ├── quotes/                 # Quote listing + detail + checkout
│   │   ├── orders/                 # Order listing + detail (with ERP #)
│   │   ├── invoices/               # Invoice listing + detail
│   │   ├── shopping-lists/         # Shopping list management
│   │   ├── addresses/              # Address book
│   │   └── user-management/        # Company user management
│   └── product/[slug]/
│       ├── _actions/add-to-cart-flooring.ts  # Decimal qty server action
│       └── _components/
│           ├── b2b-pdp-actions.tsx            # Add to Quote / Shopping List
│           └── flooring-calculator-wrapper.tsx
├── b2b/
│   ├── server-actions.ts           # ALL B2B server actions (quote, order, invoice, etc.)
│   └── components/B2BNavigation.tsx
├── client/
│   ├── b2b-client.ts               # B2B REST Management API client
│   └── bc-management-client.ts     # BC V2/V3 Management API client
├── auth/
│   └── server.ts                   # NextAuth + anonymous session + resilient JWT decode
└── features/makeswift/
    └── components/flooring-calculator/  # Makeswift-registered components
```

Make each file/folder clickable to show a 1-sentence description tooltip.

---

### Footer

A centered footer with:
- "B2B on Catalyst | BigCommerce | 2026"
- "Built with v0 + Cursor + Catalyst"
- A small "Last updated: February 2026" note
- Link to BigCommerce B2B API docs: developer.bigcommerce.com/b2b-edition

---

### Global Requirements

1. Make the entire app self-contained with no external dependencies beyond React, Tailwind, shadcn/ui, and lucide-react.
2. Use localStorage to track which sections have been viewed and show a progress bar in the header.
3. Add a "Print View" button in the header that collapses all interactive elements into a static printable layout.
4. Add smooth scroll-to-section behavior when clicking nav items.
5. Use subtle animations (fade-in on section entry using Intersection Observer or framer-motion).
6. Make it deployable to Vercel with zero configuration -- just a single page app with all sections.
7. The color palette should use: blue (portal comparison), green (architecture), purple (auth), amber (channel-scoping), orange (API ref), teal (decision tree), red (issues), indigo (AI workflow), gray (file reference). Dark slate/zinc background throughout.
