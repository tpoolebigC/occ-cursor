<a href="https://catalyst.dev" target="_blank" rel="noopener norerrer">
  <img src="https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_banner.png" alt="Catalyst for Composable Commerce Image Banner" title="Catalyst">
</a>

<br />
<br />

<div align="center">

[![MIT License](https://img.shields.io/github/license/bigcommerce/catalyst)](LICENSE.md)
[![Lighthouse Report](https://github.com/bigcommerce/catalyst/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/bigcommerce/catalyst/actions/workflows/lighthouse.yml) [![Lint, Typecheck, gql.tada](https://github.com/bigcommerce/catalyst/actions/workflows/basic.yml/badge.svg)](https://github.com/bigcommerce/catalyst/actions/workflows/basic.yml)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/bigcommerce/catalyst)

</div>

**Catalyst** is the composable, fully customizable headless commerce framework for
[BigCommerce](https://www.bigcommerce.com/). Catalyst is built with [Next.js](https://nextjs.org/), uses
our [React](https://react.dev/) storefront components, and is backed by the
[GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql).

By choosing Catalyst, you'll have a fully-functional storefront within a few seconds, and spend zero time on wiring
up APIs or building SEO, Accessibility, and Performance-optimized ecommerce components you've probably written many
times before. You can instead go straight to work building your brand and making this your own.

## 🏢 B2B Buyer Portal Implementation

This repository includes a **complete B2B Buyer Portal implementation** built on top of Catalyst, providing enterprise-grade B2B functionality for BigCommerce stores.

### ✅ **What's Been Implemented**

#### **Core B2B Dashboard**
- **Custom Dashboard** (`/custom-dashboard`) with unified navigation
- **Order Management** - View order history, order details, reorder functionality
- **Invoice Management** - View invoice history, invoice details, payment actions
- **Quote Management** - View quote history, quote details, approval workflow
- **Quick Order** - Product search, bulk ordering, cart integration

#### **Technical Implementation**
- **Proper Catalyst API Integration** - Uses correct `site.cart()` and `site.search.searchProducts()` patterns
- **Cart Synchronization** - Seamless integration with BigCommerce cart using Catalyst utilities
- **B2B Authentication** - Integration with BigCommerce B2B Edition authentication
- **Algolia Search** - Product search with fallback to GraphQL
- **TypeScript Support** - Full type safety and error handling
- **Responsive Design** - Mobile-friendly B2B interface

#### **Key Features**
- **Reorder from History** - One-click reordering from order details
- **Product Search** - Algolia-powered search with price/SKU display
- **Cart Management** - Add to cart, view cart, proceed to checkout
- **Navigation** - Clean, consistent navigation without duplicate elements
- **Error Handling** - Comprehensive error boundaries and loading states

### 🚧 **What's Left to Implement**

#### **Pending Features**
- **Shopping Lists** - Create, manage, and share shopping lists
- **Address Management** - B2B address book functionality
- **User Management** - Role-based permissions and user administration
- **Advanced Quote Features** - Quote creation, approval workflows
- **Bulk Operations** - CSV import/export for orders and products

#### **Documentation**
- **API Testing Tools** - Debug interface for testing B2B API calls
- **User Guides** - End-user documentation for B2B features
- **Admin Guides** - Setup and configuration documentation

### 🚀 **Getting Started**

#### **Prerequisites**
- BigCommerce store with **B2B Edition** enabled
- **B2B API access** with proper credentials
- **Algolia account** for product search (optional but recommended)

#### **Environment Setup**
```env
# BigCommerce Configuration
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_CLIENT_ID=your_client_id
BIGCOMMERCE_CLIENT_SECRET=your_client_secret
BIGCOMMERCE_ACCESS_TOKEN=your_access_token

# B2B Configuration
B2B_API_TOKEN=your_b2b_api_token_here
B2B_API_HOST=https://api-b2b.bigcommerce.com/

# Algolia Configuration (Optional)
ALGOLIA_APPLICATION_ID=your_algolia_app_id
ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
ALGOLIA_INDEX_NAME=your_algolia_index_name
```

#### **Installation**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Access B2B Dashboard
# http://localhost:3000/custom-dashboard
```

### 📚 **Documentation**

- **[B2B Setup Guide](docs/B2B_SETUP.md)** - Complete setup instructions
- **[Algolia Integration](docs/ALGOLIA_SETUP.md)** - Search configuration
- **[Troubleshooting](docs/TROUBLESHOOTING_AND_FIXES.md)** - Common issues and solutions
- **[API Reference](docs/B2B_AUTH_GRAPHQL_GUIDE.md)** - B2B API integration guide

### 🏗️ **Architecture**

```
core/
├── app/[locale]/(default)/custom-dashboard/  # B2B Dashboard Routes
│   ├── page.tsx                              # Main dashboard
│   ├── orders/                               # Order management
│   ├── invoices/                             # Invoice management
│   ├── quotes/                               # Quote management
│   └── quick-order/                          # Quick order functionality
├── b2b/                                      # B2B Components & Services
│   ├── components/                           # B2B UI components
│   ├── services/                             # Cart & API services
│   ├── server-actions.ts                     # Server-side data fetching
│   └── utils/                                # B2B utilities
└── components/                               # Shared components
```

### 🤝 **Contributing**

This is a production-ready B2B implementation. When contributing:

1. **Test thoroughly** - B2B features affect real business operations
2. **Follow Catalyst patterns** - Use existing utilities and API patterns
3. **Update documentation** - Keep guides current with implementation
4. **Consider backwards compatibility** - B2B customers depend on stability

### 📞 **Support**

- **BigCommerce Developer Community** - [Community Forum](https://developer.bigcommerce.com/community)
- **Catalyst Documentation** - [catalyst.dev](https://catalyst.dev/docs/)
- **B2B API Documentation** - [BigCommerce B2B Docs](https://developer.bigcommerce.com/docs/b2b)

---

## Demo

- [Catalyst Demo](https://catalyst-demo.site)

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

<p align="center">
 <a href="https://www.catalyst.dev">🚀 catalyst.dev</a> •
 <a href="https://developer.bigcommerce.com/community">🤗 BigCommerce Developer Community</a> •
 <a href="https://github.com/bigcommerce/catalyst/discussions">💬 GitHub Discussions</a> •
 <a href="/docs">💡 Docs in this repo</a>
</p>

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

## Deploy via One-Click Catalyst App

The easiest way to deploy your Catalyst Storefront is to use the [One-Click Catalyst App](http://login.bigcommerce.com/deep-links/app/53284) available in the BigCommerce App Marketplace.

Check out the [Catalyst.dev One-Click Catalyst Documentation](https://www.catalyst.dev/docs/getting-started) for more details.

## Getting Started

**Requirements:**

- A [BigCommerce account](https://www.bigcommerce.com/start-your-trial)
- Node.js version 20 or 22
- Corepack-enabled `pnpm`

  ```bash
  corepack enable pnpm
  ```

1. Install the latest version of Catalyst:

   ```bash
   pnpm create @bigcommerce/catalyst@latest
   ```

2. Run the local development server:

   ```bash
   pnpm run dev
   ```

Learn more about Catalyst at [catalyst.dev](https://catalyst.dev).

## Resources

- [Catalyst Documentation](https://catalyst.dev/docs/)
- [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
- [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
- [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)
