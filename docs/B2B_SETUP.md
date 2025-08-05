# 🏢 B2B Buyer Portal Setup: Complete Implementation Guide

## 📋 **Overview**

This repository provides a clean, production-ready B2B buyer portal implementation built on **Catalyst** and **Makeswift**, using **gql-tada** for type-safe GraphQL operations. This serves as a foundational base for enterprise agencies building B2B e-commerce solutions.

## 🎯 **Key Features**

### ✅ **What Makes This Work**
- **gql-tada Integration** - Uses `gql.tada` for type-safe GraphQL queries
- **Proper Catalyst API Integration** - Uses `site.cart()` and `site.search.searchProducts()` patterns
- **Official B2B Integration** - Leverages BigCommerce's B2B Edition features
- **Production-Ready Architecture** - Scalable, maintainable, and secure
- **Comprehensive Error Handling** - Robust error boundaries and fallbacks
- **TypeScript Support** - Full type safety and developer experience
- **Clean Codebase** - No legacy dependencies or duplicate implementations

### ❌ **What We Avoided**
- **B3 Dependencies** - Removed all B3Storage and external B2B dependencies
- **Custom B2B implementations** - Too complex, too many edge cases
- **Direct API manipulation** - Missing critical features, hard to maintain
- **Third-party dependencies** - Expensive, not well integrated
- **Legacy code duplication** - Single source of truth for all B2B operations

## 🏗️ **Architecture**

### **Core Components**

```
core/b2b/
├── client/
│   └── b2b-graphql-client.ts    # Centralized gql-tada client
├── components/
│   ├── CustomB2BDashboard.tsx   # Main B2B dashboard
│   ├── B2BNavigation.tsx        # B2B navigation component
│   ├── QuickOrderTable.tsx      # Product search and ordering
│   ├── QuickOrderPad.tsx        # SKU-based quick ordering
│   └── ReorderButton.tsx        # Reorder functionality
├── services/
│   └── cartService.ts           # Cart operations using Catalyst
├── server-actions.ts            # Server actions using gql-tada
└── utils/
    └── b2bAuthManager.ts        # B2B authentication management
```

### **Key Design Principles**

1. **Single Source of Truth**: All GraphQL operations go through `b2b-graphql-client.ts`
2. **Catalyst Integration**: Uses Catalyst's built-in patterns and utilities
3. **Type Safety**: Full TypeScript support with gql-tada generated types
4. **Server Actions**: All data operations use Next.js server actions
5. **Clean Separation**: Clear separation between client and server code

## 🚀 **Getting Started**

### **Prerequisites**
- BigCommerce B2B Edition store
- Catalyst project setup
- Makeswift integration (optional)

### **Installation**

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd custom-portal-project
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```env
   BIGCOMMERCE_STORE_HASH=your_store_hash
   BIGCOMMERCE_CLIENT_ID=your_client_id
   BIGCOMMERCE_CLIENT_SECRET=your_client_secret
   BIGCOMMERCE_CHANNEL_ID=your_channel_id
   ```

4. **Start development server**:
   ```bash
   pnpm run dev
   ```

## 📖 **Usage**

### **B2B Dashboard**

The main B2B dashboard is available at `/custom-dashboard` and provides:

- Customer information display
- Order history and management
- Quick order functionality
- Cart management
- B2B-specific navigation

### **Quick Order**

Access quick order functionality at `/custom-dashboard/quick-order`:

- Product search by SKU or name
- Bulk product addition
- Real-time cart updates
- Order summary and checkout

### **API Integration**

All B2B operations use the centralized gql-tada client:

```typescript
import { getCustomerInfo, getOrders, getCart } from '~/b2b/server-actions';

// Get customer information
const customer = await getCustomerInfo();

// Get order history
const orders = await getOrders(10);

// Get current cart
const cart = await getCart();
```

## 🔧 **Customization**

### **Adding New B2B Features**

1. **Define GraphQL queries** in `b2b-graphql-client.ts`
2. **Create server actions** in `server-actions.ts`
3. **Build UI components** in `b2b/components/`
4. **Add services** in `b2b/services/` if needed

### **Styling**

The B2B components use Tailwind CSS and follow Catalyst's design patterns. Customize by:

- Modifying component styles in the respective `.tsx` files
- Updating Tailwind classes for consistent theming
- Following Catalyst's component patterns

## 🧪 **Testing**

### **Type Checking**
```bash
pnpm run typecheck
```

### **Development Testing**
1. Start the development server
2. Navigate to `/custom-dashboard`
3. Test B2B functionality with a B2B customer account
4. Verify cart operations and order management

## 📚 **Documentation**

### **Key Files**

- `docs/B2B_SETUP.md` - This setup guide
- `core/b2b/client/b2b-graphql-client.ts` - GraphQL client implementation
- `core/b2b/server-actions.ts` - Server actions documentation
- `core/b2b/components/CustomB2BDashboard.tsx` - Main dashboard component

### **Architecture Decisions**

1. **gql-tada over other GraphQL clients**: Better type safety and Catalyst integration
2. **Server actions over API routes**: Better performance and security
3. **Catalyst patterns over custom implementations**: Maintainability and consistency
4. **Single client architecture**: Prevents code duplication and inconsistencies

## 🤝 **Contributing**

This repository serves as a foundational base for enterprise agencies. When contributing:

1. Follow Catalyst's coding standards
2. Maintain type safety with gql-tada
3. Use server actions for data operations
4. Keep the codebase clean and documented
5. Test thoroughly before submitting changes

## 📄 **License**

This project follows the same license as the Catalyst framework.

---

**Built with ❤️ for enterprise B2B e-commerce** 