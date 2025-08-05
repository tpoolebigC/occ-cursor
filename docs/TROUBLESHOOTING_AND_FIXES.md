# 🚨 B2B Buyer Portal Troubleshooting Guide

This guide covers common issues and solutions for the BigCommerce B2B Buyer Portal implementation built on Catalyst. These are **real problems we solved** during development.

## 🎯 **What This Guide Covers**

This troubleshooting guide addresses issues specific to our **production-ready B2B implementation**:

- **B2B authentication and script loading issues**
- **Cart integration problems with Catalyst utilities**
- **GraphQL query errors and API integration issues**
- **Navigation and UI problems**
- **Environment variable configuration issues**
- **Performance and error handling problems**

## 🚨 **Critical Issues and Fixes**

### **Issue 1: B2B Script Not Loading (500 Errors)**

**The Problem:** 
B2B script fails to load, causing 500 errors across the custom dashboard.

**Symptoms:**
- 500 errors on `/custom-dashboard` routes
- B3Storage not available in browser
- B2B authentication failing
- Console errors about missing B2B script

**Root Cause:**
- Incorrect import paths in `cartService.ts`
- Missing environment variables
- B2B script configuration issues

**The Solution:**
1. **Fix Import Paths** - Use correct Catalyst utilities:
```typescript
// CORRECT - Use Catalyst's official utilities
import { addToOrCreateCart } from '~/lib/cart';
import { getCart as getCartData } from '~/client/queries/get-cart';

// INCORRECT - Custom GraphQL mutations
// import { ADD_CART_LINE_ITEMS } from './graphql';
```

2. **Verify Environment Variables**:
```env
# Required for B2B functionality
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
B2B_API_TOKEN=your_b2b_api_token_here
```

3. **Check B2B Script Configuration**:
```tsx
// core/components/b2b/b2b-script.tsx
const b2bConfig = {
  platform: 'catalyst',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH,
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  environment: 'production'
};
```

**Verification:**
```bash
# Test basic functionality
curl http://localhost:3000/custom-dashboard/test-page

# Check TypeScript compilation
pnpm typecheck
```

### **Issue 2: GraphQL Query Errors**

**The Problem:**
GraphQL queries fail with schema errors or return incorrect data.

**Common Errors:**
- `Cannot query field 'cart' on type 'Query'`
- `Cannot query field 'entityId' on type 'ProductConnection'`
- `Cannot query field 'sku' on type 'OrderPhysicalLineItem'`

**The Solution:**
Use correct BigCommerce GraphQL patterns:

```typescript
// CORRECT - Cart queries
const GET_CART = graphql(`
  query GetCart($cartId: String!) {
    site {
      cart(entityId: $cartId) {
        entityId
        lineItems {
          physicalItems {
            entityId
            productEntityId
            name
            sku
            quantity
            imageUrl
            extendedListPrice { value }
            extendedSalePrice { value }
          }
        }
      }
    }
  }
`);

// CORRECT - Product search
const SEARCH_PRODUCTS = graphql(`
  query SearchProducts($searchTerm: String!, $first: Int = 10) {
    site {
      search {
        searchProducts(filters: { searchTerm: $searchTerm }) {
          products(first: $first) {
            edges {
              node {
                entityId
                name
                sku
                prices {
                  price { value currencyCode }
                  salePrice { value currencyCode }
                }
                defaultImage { url(width: 100) altText }
              }
            }
          }
        }
      }
    }
  }
`);

// CORRECT - Order queries
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

### **Issue 3: Cart Integration Problems**

**The Problem:**
Cart operations fail or don't synchronize properly.

**Symptoms:**
- Items not adding to cart
- Cart not updating in header
- Reorder functionality broken
- Cart errors in console

**The Solution:**
Use Catalyst's official cart utilities:

```typescript
// CORRECT - Cart service implementation
import { auth } from '~/auth';
import { addToOrCreateCart } from '~/lib/cart';
import { getCart as getCartData } from '~/client/queries/get-cart';

export async function addToCart(items: CartItem[]): Promise<{ success: boolean; cart?: Cart; errors?: string[] }> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      return { success: false, errors: ['No customer access token available'] };
    }
    
    const cartData = {
      lineItems: items.map(item => ({
        productEntityId: item.productEntityId,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || []
      }))
    };
    
    await addToOrCreateCart(cartData);
    const cartResult = await getCart();
    return { success: true, cart: cartResult.cart };
  } catch (error) {
    console.error('🛒 [Cart Service] Error adding to cart:', error);
    return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}
```

### **Issue 4: Navigation Duplication**

**The Problem:**
Duplicate navigation elements (search, cart, user icons) appear in header.

**Symptoms:**
- Search icon appears twice
- Cart icon duplicated
- User icon duplicated
- Currency selector duplicated

**The Solution:**
Conditionally hide navigation elements in custom dashboard:

```tsx
// core/components/header/index.tsx
const headersList = await headers();
const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
const isCustomDashboard = pathname.startsWith('/custom-dashboard');

<HeaderSection
  navigation={{
    // ... other props
    hideNavigationElements: isCustomDashboard,
  }}
/>
```

```tsx
// core/vibes/soul/primitives/navigation/index.tsx
export const Navigation = forwardRef(function Navigation<S extends SearchResult>(
  {
    // ... other props
    hideNavigationElements = false,
  }: Props<S>,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <nav>
      {/* ... navigation content */}
      {!hideNavigationElements && (
        <div className="flex items-center justify-end gap-0.5">
          {/* Search, User, Cart, Locale, Currency components */}
        </div>
      )}
    </nav>
  );
});
```

### **Issue 5: Quick Order Search Not Working**

**The Problem:**
Product search in Quick Order returns empty results or missing data.

**Symptoms:**
- Search returns no products
- Prices and SKUs are empty
- Product images not displaying
- Search errors in console

**The Solution:**
Implement robust search with Algolia fallback:

```typescript
// Enhanced search with proper error handling
export async function searchAlgoliaProducts(query: string): Promise<AlgoliaProduct[]> {
  try {
    // Check Algolia environment variables
    const algoliaAppId = process.env.ALGOLIA_APPLICATION_ID;
    const algoliaSearchKey = process.env.ALGOLIA_SEARCH_API_KEY;
    const algoliaIndexName = process.env.ALGOLIA_INDEX_NAME;

    if (!algoliaAppId || !algoliaSearchKey || !algoliaIndexName) {
      console.log('🔍 [Algolia] Environment variables missing, falling back to GraphQL');
      return await searchProductsGraphQL(query);
    }

    // Initialize Algolia client
    const algoliasearch = (await import('algoliasearch')).default;
    const client = algoliasearch(algoliaAppId, algoliaSearchKey);
    const index = client.initIndex(algoliaIndexName);

    // Search with enhanced attributes
    const { hits } = await index.search(query, {
      attributesToRetrieve: [
        'name', 'sku', 'product_id', 'default_price', 'sale_price',
        'default_image', 'images', 'brand_name'
      ],
      hitsPerPage: 20
    });

    if (!hits || hits.length === 0) {
      console.log('🔍 [Algolia] No results, falling back to GraphQL');
      return await searchProductsGraphQL(query);
    }

    // Transform results with robust data mapping
    return hits.map((hit: any) => ({
      productId: hit.product_id || hit.objectID,
      name: hit.name || 'Unknown Product',
      sku: hit.sku || '',
      price: hit.default_price || hit.price || 0,
      salePrice: hit.sale_price || null,
      imageUrl: hit.default_image?.url || hit.images?.[0]?.url || '',
      brand: hit.brand_name || ''
    }));
  } catch (error) {
    console.error('🔍 [Algolia] Search error, falling back to GraphQL:', error);
    return await searchProductsGraphQL(query);
  }
}
```

### **Issue 6: Environment Variable Problems**

**The Problem:**
Environment variables not being loaded or recognized.

**Symptoms:**
- B2B script not loading
- API calls failing
- Configuration errors
- Empty values in logs

**The Solution:**
1. **Verify `.env.local` file**:
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

# Algolia Configuration
ALGOLIA_APPLICATION_ID=your_algolia_app_id
ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
ALGOLIA_INDEX_NAME=your_algolia_index_name
```

2. **Add environment variable logging**:
```tsx
// core/app/[locale]/(default)/custom-dashboard/page.tsx
console.log('CustomDashboardPage Environment Variables:', {
  storeHash: process.env.BIGCOMMERCE_STORE_HASH,
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  hasStoreHash: !!process.env.BIGCOMMERCE_STORE_HASH,
  hasChannelId: !!process.env.BIGCOMMERCE_CHANNEL_ID
});
```

3. **Restart development server**:
```bash
# Stop server and clear cache
pkill -f "next dev"
rm -rf .next
pnpm run dev
```

### **Issue 7: TypeScript Compilation Errors**

**The Problem:**
TypeScript errors preventing build or causing runtime issues.

**Common Errors:**
- `Module not found: Can't resolve '~/lib/cart/get-cart'`
- `Property 'sku' does not exist on type 'OrderPhysicalLineItem'`
- `Type 'undefined' is not assignable to type 'string'`

**The Solution:**
1. **Fix import paths**:
```typescript
// CORRECT import paths
import { getCart as getCartData } from '~/client/queries/get-cart';
import { addToOrCreateCart } from '~/lib/cart';
```

2. **Add proper type definitions**:
```typescript
// Make optional properties optional
interface ReorderButtonProps {
  orderId: number;
  lineItems: Array<{
    node: {
      entityId: number;
      productEntityId: number;
      name: string;
      sku?: string; // Make optional
      quantity: number;
      subTotalListPrice: {
        value: number;
        currencyCode: string;
      };
    };
  }>;
}
```

3. **Add null checks**:
```typescript
// Add null checks for potentially undefined values
const orderStatus = order.status?.value || 'Unknown';
const lineItems = order.consignments?.shipping?.edges?.[0]?.node?.lineItems?.edges || [];
```

## 🔍 **Debugging Tools**

### **Test Pages**
Use these test pages to verify functionality:

```bash
# Basic functionality test
http://localhost:3000/custom-dashboard/test-page

# Simple test page
http://localhost:3000/simple-test-page

# API debugger (built into dashboard)
http://localhost:3000/custom-dashboard
```

### **Console Logging**
Look for these log patterns:

```javascript
// B2B Script Loading
B2B Script loaded successfully
B3Storage available: true

// Cart Operations
🛒 [Cart Service] Adding items to cart: [...]
🛒 [Cart Service] Successfully added items to cart

// API Calls
[BigCommerce] query GetOrders - 254ms - complexity 2658
Orders response: { data: { customer: { orders: [...] } } }

// Search Operations
🔍 [Algolia] Environment check: { appId: 'SET', appKey: 'SET', ... }
```

### **Environment Variable Check**
```bash
# Check environment variables
curl http://localhost:3000/custom-dashboard/test-page

# Check TypeScript compilation
pnpm typecheck

# Check build process
pnpm run build
```

## 🚀 **Performance Optimization**

### **Common Performance Issues**
1. **Slow API responses** - Implement caching
2. **Large bundle size** - Use dynamic imports
3. **Memory leaks** - Clean up event listeners
4. **Slow page loads** - Optimize images and code splitting

### **Performance Solutions**
```typescript
// Implement caching for API responses
const cache = new Map();

export async function getCachedData(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetcher();
  cache.set(key, data);
  return data;
}

// Use dynamic imports for large components
const QuickOrderModal = dynamic(() => import('./QuickOrderModal'), {
  loading: () => <div>Loading...</div>
});
```

## 📞 **Getting Help**

### **When to Seek Help**
1. **500 errors persist** after trying all solutions
2. **GraphQL schema errors** that don't match documentation
3. **Performance issues** affecting user experience
4. **Security concerns** with B2B data

### **Information to Provide**
When seeking help, include:
- **Error messages** from console
- **Environment variable status** (without sensitive data)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Browser and device information**

### **Resources**
- **BigCommerce Developer Community** - [Community Forum](https://developer.bigcommerce.com/community)
- **Catalyst Documentation** - [catalyst.dev](https://catalyst.dev/docs/)
- **B2B API Documentation** - [BigCommerce B2B Docs](https://developer.bigcommerce.com/docs/b2b)

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready 