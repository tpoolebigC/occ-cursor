# 🏢 B2B Buyer Portal Setup: Complete Implementation Guide

This guide covers the complete setup and implementation of the BigCommerce B2B Buyer Portal built on Catalyst. This is a **production-ready implementation** that follows BigCommerce's official patterns and best practices.

## 🎯 **What You're Building**

A **complete B2B Buyer Portal** that provides enterprise-grade functionality for BigCommerce stores:

### ✅ **Implemented Features**
- **Custom Dashboard** - Unified B2B interface with clean navigation
- **Order Management** - Complete order history, details, and reorder functionality
- **Invoice Management** - Invoice history, details, and payment actions
- **Quote Management** - Quote history and basic quote details
- **Quick Order** - Product search, bulk ordering, cart integration
- **Cart Synchronization** - Seamless integration with BigCommerce cart
- **B2B Authentication** - Proper integration with BigCommerce B2B Edition

### 🚧 **Pending Features**
- **Shopping Lists** - Create, manage, and share shopping lists
- **Address Management** - B2B address book functionality
- **User Management** - Role-based permissions and user administration
- **Advanced Quote Features** - Quote creation, approval workflows

## 🚨 **Important: Why This Implementation Works**

We've built this using **BigCommerce's official patterns** and **Catalyst's recommended approaches**:

### ✅ **What Makes This Work**
- **Proper Catalyst API Integration** - Uses `site.cart()` and `site.search.searchProducts()` patterns
- **Official B2B Integration** - Leverages BigCommerce's B2B Edition features
- **Production-Ready Architecture** - Scalable, maintainable, and secure
- **Comprehensive Error Handling** - Robust error boundaries and fallbacks
- **TypeScript Support** - Full type safety and developer experience

### ❌ **What We Avoided**
- **Custom B2B implementations** - Too complex, too many edge cases
- **Direct API manipulation** - Missing critical features, hard to maintain
- **Third-party dependencies** - Expensive, not well integrated

## 🛠️ **Prerequisites**

### **BigCommerce Store Setup**
- ✅ **B2B Edition enabled** in your BigCommerce admin
- ✅ **B2B API access** with proper credentials
- ✅ **Customer groups configured** for B2B customers
- ✅ **Pricing rules set up** for B2B discounts

### **Development Environment**
- ✅ **Node.js 20+** (required for Catalyst)
- ✅ **BigCommerce store** with API access
- ✅ **Environment variables** properly configured
- ✅ **Algolia account** (optional but recommended for search)

## 🚀 **Step-by-Step Setup**

### **Step 1: Enable B2B Features in BigCommerce**

1. **Go to your BigCommerce admin**
2. **Navigate to Settings → Store Setup → B2B**
3. **Enable B2B Features** (this is the magic switch!)
4. **Configure customer groups** for B2B customers
5. **Set up pricing rules** and discounts

**Pro Tip:** Make sure you have at least one customer group set up for B2B customers. This is crucial for the integration to work properly.

### **Step 2: Get Your B2B API Credentials**

1. **Go to Settings → API → B2B API**
2. **Copy your B2B API Token** (keep this safe - you'll need it!)
3. **Note the B2B API host**: `https://api-b2b.bigcommerce.com/`

**Important:** The B2B API token is different from your regular BigCommerce API token. You need both!

### **Step 3: Configure Your Environment Variables**

Add these to your `.env.local` file:

```env
# BigCommerce Configuration (The Basics)
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_CLIENT_ID=your_client_id
BIGCOMMERCE_CLIENT_SECRET=your_client_secret
BIGCOMMERCE_ACCESS_TOKEN=your_access_token

# B2B Configuration (The B2B Magic)
B2B_API_TOKEN=your_b2b_api_token_here
B2B_API_HOST=https://api-b2b.bigcommerce.com/

# Algolia Configuration (For Search Integration)
ALGOLIA_APPLICATION_ID=your_algolia_app_id
ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
ALGOLIA_INDEX_NAME=your_algolia_index_name
```

**Critical Note:** Make sure `B2B_API_TOKEN` is **required**, not optional. We learned this the hard way!

### **Step 4: Install and Run the Application**

The B2B integration is already included in this repository. Here's how to get it running:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Access B2B Dashboard
# http://localhost:3000/custom-dashboard
```

## 🏗️ **Architecture Overview**

### **File Structure**
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

### **Key Components**

#### **B2B Dashboard (`/custom-dashboard`)**
- **Main Dashboard** - Overview of orders, invoices, quotes
- **Unified Navigation** - Clean navigation without duplicate elements
- **Error Boundaries** - Comprehensive error handling
- **Loading States** - Proper loading indicators

#### **Order Management**
- **Order History** - List all orders with pagination
- **Order Details** - Comprehensive order information
- **Reorder Functionality** - One-click reordering
- **Line Item Display** - Product images, prices, SKUs

#### **Quick Order**
- **Product Search** - Algolia-powered search with GraphQL fallback
- **Search Results** - Product images, prices, SKUs displayed correctly
- **Add to Cart** - Seamless cart integration
- **Bulk Order Entry** - CSV upload and manual entry

#### **Cart Integration**
- **Add to Cart** - Using Catalyst's `addToOrCreateCart()` utility
- **Get Cart** - Using Catalyst's `getCart()` utility
- **Cart Synchronization** - Real-time updates across components
- **Proceed to Checkout** - Direct checkout integration

## 🔧 **Configuration Details**

### **B2B Script Configuration**

The B2B script is configured in `core/components/b2b/b2b-script.tsx`:

```tsx
// B2B Script Configuration
const b2bConfig = {
  platform: 'catalyst',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH,
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  environment: 'production'
};
```

### **Cart Service Configuration**

Cart operations use Catalyst's official utilities:

```tsx
// Cart Service using Catalyst utilities
import { addToOrCreateCart } from '~/lib/cart';
import { getCart as getCartData } from '~/client/queries/get-cart';

export async function addToCart(items: CartItem[]) {
  const cartData = {
    lineItems: items.map(item => ({
      productEntityId: item.productEntityId,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions || []
    }))
  };
  await addToOrCreateCart(cartData);
}
```

### **API Integration**

Server actions use proper BigCommerce patterns:

```tsx
// GraphQL queries using correct patterns
const GET_ORDERS = graphql(`
  query GetOrders($first: Int = 50) {
    customer {
      orders(first: $first) {
        edges {
          node {
            entityId
            orderedAt { utc }
            status { value }
            totalIncTax { value }
            consignments {
              shipping {
                edges {
                  node {
                    lineItems {
                      edges {
                        node {
                          entityId
                          productEntityId
                          name
                          quantity
                          image { url altText }
                          subTotalListPrice { value currencyCode }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);
```

## 🧪 **Testing Your Setup**

### **1. Verify Environment Variables**
```bash
# Check if environment variables are loaded
curl http://localhost:3000/custom-dashboard/test-page
```

### **2. Test B2B Authentication**
- Navigate to `/custom-dashboard`
- Check browser console for B2B script loading
- Verify B3Storage is available

### **3. Test Order Data**
- Navigate to `/custom-dashboard/orders`
- Verify orders are displayed with proper data
- Test order details page

### **4. Test Quick Order**
- Navigate to `/custom-dashboard/quick-order`
- Search for products
- Verify prices and SKUs are displayed
- Test add to cart functionality

### **5. Test Cart Integration**
- Add items to cart from Quick Order
- Verify cart updates in header
- Test reorder functionality from order history

## 🚨 **Common Issues and Solutions**

### **Issue: B2B Script Not Loading**
**Solution:** Check environment variables and B2B script configuration in `b2b-script.tsx`

### **Issue: Orders Not Displaying**
**Solution:** Verify GraphQL queries and customer authentication

### **Issue: Cart Not Updating**
**Solution:** Check cart service configuration and Catalyst utilities

### **Issue: Search Not Working**
**Solution:** Verify Algolia configuration or check GraphQL fallback

## 📚 **Additional Resources**

- **[Implementation Status](IMPLEMENTATION_STATUS.md)** - Complete feature status
- **[Algolia Setup](ALGOLIA_SETUP.md)** - Search configuration guide
- **[Troubleshooting](TROUBLESHOOTING_AND_FIXES.md)** - Common issues and solutions
- **[API Reference](B2B_AUTH_GRAPHQL_GUIDE.md)** - B2B API integration guide

## 🎯 **Next Steps**

After setting up the basic B2B functionality:

1. **Test all features** - Ensure everything works as expected
2. **Customize styling** - Match your brand requirements
3. **Configure permissions** - Set up user roles and access control
4. **Deploy to production** - Follow deployment best practices
5. **Monitor performance** - Track key metrics and user experience

## 🤝 **Support**

For questions or issues:

- **BigCommerce Developer Community** - [Community Forum](https://developer.bigcommerce.com/community)
- **Catalyst Documentation** - [catalyst.dev](https://catalyst.dev/docs/)
- **B2B API Documentation** - [BigCommerce B2B Docs](https://developer.bigcommerce.com/docs/b2b)

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready 