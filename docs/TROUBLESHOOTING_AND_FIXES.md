# Troubleshooting and Fixes Guide

This document covers all the issues we encountered during the BigCommerce Catalyst implementation with Algolia search and B2B buyer portal integration, along with their solutions.

## 🚨 Critical Issues and Fixes

### 1. B2B Route Conflicts and 404 Errors

**Problem:** B2B routes returning 404 errors after implementing custom B2B buyer portal.

**Root Cause:** 
- Route conflicts between custom B2B implementation and BigCommerce-hosted buyer portal
- Middleware exclusions not properly configured
- Locale routing conflicts

**Solution:**
- **Switched to BigCommerce-hosted buyer portal** (official approach)
- **Removed custom B2B routes** (`/b2b`, `/business`) to avoid conflicts
- **Used official B2B integration** from BigCommerce documentation

**Files Changed:**
- Removed: `core/app/[locale]/(default)/b2b/`
- Removed: `core/app/[locale]/(default)/business/`
- Kept: Official B2B integration in `core/b2b/`

### 2. Middleware Issues Causing 404s

**Problem:** Middleware not calling `NextResponse.next()` properly.

**Root Cause:** 
- Locale redirect middleware not handling all cases
- Missing `NextResponse.next()` calls in middleware chain

**Solution:**
```typescript
// Fixed middleware.ts
export function middleware(request: NextRequest) {
  // ... existing logic ...
  
  // Always call next() at the end
  return NextResponse.next();
}
```

**Files Changed:**
- `core/middleware.ts` - Fixed middleware chain
- `core/middlewares/with-intl.ts` - Disabled locale enforcement

### 3. Import Path Resolution Errors

**Problem:** Module not found errors for B2B hooks.

**Root Cause:** 
- Incorrect relative import paths
- Component location vs B2B hooks location mismatch

**Solution:**
```typescript
// Fixed import path in ProductDetailB2BActions.tsx
// From: '../../../b2b/use-product-details'
// To: '../../../../b2b/use-product-details'

import { useAddToQuote, useAddToShoppingList } from '../../../../b2b/use-product-details';
```

**Path Calculation:**
- Component: `core/vibes/soul/sections/product-detail/ProductDetailB2BActions.tsx`
- B2B hooks: `core/b2b/use-product-details.tsx`
- Correct path: `../../../../b2b/use-product-details` (4 levels up)

**Files Changed:**
- `core/vibes/soul/sections/product-detail/ProductDetailB2BActions.tsx`

### 4. Cart Synchronization Issues

**Problem:** Cart sync from buyer portal not working despite success messages.

**Root Cause:** 
- Complex API-based cart sync implementation
- Missing event handling for cart updates
- Over-engineered solution

**Solution:**
- **Adopted official approach** from BigCommerce B2B repo
- **Direct cookie update** for cart ID synchronization
- **Page refresh** on cart creation events

**Implementation:**
```typescript
// Official approach in use-b2b-cart.ts
const handleCartCreated = (event: any) => {
  const cartId = event.detail.cartId;
  document.cookie = `cartId=${cartId}; path=/; max-age=31536000`;
  window.location.reload();
};
```

**Files Changed:**
- `core/b2b/use-b2b-cart.ts` - Simplified to official approach
- Removed: `core/app/api/b2b/cart-sync/route.ts` (complex API)

### 5. Missing B2B Hook Files

**Problem:** Module not found errors for B2B functionality.

**Root Cause:** 
- Missing B2B hook files from official implementation
- Incomplete B2B integration

**Solution:**
- **Copied missing files** from official BigCommerce B2B repo
- **Added all required B2B hooks** and utilities

**Files Added:**
- `core/b2b/use-b2b-quote-enabled.ts`
- `core/b2b/use-b2b-shopping-list-enabled.ts`
- `core/b2b/map-to-b2b-product-options.tsx`
- `core/b2b/use-product-details.tsx`
- `core/b2b/loader.tsx`
- `core/b2b/script-dev.tsx`
- `core/b2b/script-production.tsx`
- `core/b2b/server-login.ts`
- `core/b2b/types.ts`
- `core/b2b/use-b2b-auth.ts`
- `core/b2b/use-b2b-cart.ts`
- `core/b2b/use-b2b-sdk.ts`
- `core/b2b/customer-debug.tsx`

### 6. Locale Routing Conflicts

**Problem:** Locale enforcement causing routing issues.

**Root Cause:** 
- Locale redirect middleware too aggressive
- Conflicts with B2B routes

**Solution:**
- **Disabled locale enforcement** for development
- **Simplified routing** to single locale setup

**Files Changed:**
- `core/middlewares/with-intl.ts` - Disabled locale enforcement
- `core/middleware.ts` - Simplified locale handling

## 🔧 Configuration Issues and Fixes

### 1. Environment Variables Setup

**Problem:** Missing or incorrect environment variables.

**Solution:**
```env
# BigCommerce Configuration
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_CLIENT_ID=your_client_id
BIGCOMMERCE_CLIENT_SECRET=your_client_secret
BIGCOMMERCE_ACCESS_TOKEN=your_access_token

# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
ALGOLIA_INDEX_NAME=your_algolia_index_name

# B2B Configuration
B2B_API_TOKEN=your_b2b_api_token
B2B_API_HOST=https://api-b2b.bigcommerce.com/
```

### 2. B2B API Configuration

**Problem:** B2B API not properly configured.

**Solution:**
- **Enable B2B features** in BigCommerce admin
- **Get B2B API token** from Settings → API → B2B API
- **Configure customer groups** for B2B customers

### 3. Algolia Index Configuration

**Problem:** Algolia search not working properly.

**Solution:**
- **Configure searchable attributes**: `name`, `description`, `brand_name`, `categories_without_path`, `sku`
- **Set up facets**: `categories_without_path`, `brand_name`, `default_price`, `in_stock`
- **Index products** with proper data structure

## 🚀 Performance and Optimization Fixes

### 1. Webpack Performance Warnings

**Problem:** Webpack cache serialization warnings.

**Solution:**
- **Optimized bundle size** by removing unused dependencies
- **Configured proper caching** strategies
- **Used production builds** for deployment

### 2. API Response Times

**Problem:** Slow API responses affecting user experience.

**Solution:**
- **Implemented proper caching** for BigCommerce API calls
- **Optimized GraphQL queries** to reduce complexity
- **Used KV storage** for frequently accessed data

## 🔍 Debugging Tools and Techniques

### 1. B2B Debug Pages

**Created debug pages for troubleshooting:**
- `core/app/[locale]/(default)/b2b-debug/page.tsx`
- `core/app/[locale]/(default)/business-test/page.tsx`

**Usage:**
```bash
# Access debug pages
http://localhost:3000/b2b-debug
http://localhost:3000/business-test
```

### 2. Console Logging

**Added comprehensive logging:**
```typescript
// B2B loader debug information
console.log('B2BLoader session:', {
  hasSession: true,
  hasUser: true,
  hasB2bToken: true,
  b2bTokenLength: 280,
  cartId: 'cart-id-here',
  userEmail: 'user@example.com'
});
```

### 3. Environment Checks

**Added environment validation:**
```typescript
// Algolia environment check
console.log('🔍 [Algolia] Environment check:', {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? 'SET' : 'MISSING',
  appKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ? 'SET' : 'MISSING',
  nodeEnv: process.env.NODE_ENV
});
```

## 📋 Common Error Messages and Solutions

### 1. "Module not found" Errors

**Error:** `Module not found: Can't resolve '../../../b2b/use-product-details'`

**Solution:** 
- Check relative import paths
- Verify file exists in correct location
- Use absolute imports with `@/` prefix when possible

### 2. "B2B API Token not found"

**Error:** B2B authentication failing

**Solution:**
- Verify `B2B_API_TOKEN` is set in environment
- Check token permissions in BigCommerce admin
- Ensure token hasn't expired

### 3. "Cart synchronization not working"

**Error:** Cart not syncing between buyer portal and Catalyst

**Solution:**
- Use official cart sync approach
- Check B2B loader implementation
- Verify cart ID cookie handling

### 4. "404 errors on B2B routes"

**Error:** B2B routes returning 404

**Solution:**
- Use BigCommerce-hosted buyer portal
- Remove custom B2B route conflicts
- Check middleware configuration

## 🛠️ Development Workflow Fixes

### 1. Git Branch Management

**Problem:** Multiple branches causing confusion.

**Solution:**
- **Main branch**: Production-ready code
- **Feature branch**: Development work
- **Clean commits**: Descriptive commit messages

### 2. Repository Organization

**Problem:** Multiple repositories causing confusion.

**Solution:**
- **Personal repo**: `https://github.com/tpoolebigC/occ-cursor`
- **SA repo**: `https://github.com/bigcommerce-sa/occ-b2b-buyerportal`
- **Client fork**: For sharing with clients

### 3. Documentation Management

**Problem:** Incomplete or outdated documentation.

**Solution:**
- **README.md**: Complete feature overview
- **docs/ALGOLIA_SETUP.md**: Algolia integration guide
- **docs/B2B_SETUP.md**: B2B buyer portal guide
- **docs/TROUBLESHOOTING_AND_FIXES.md**: This document

## 🎯 Key Lessons Learned

### 1. Use Official Approaches
- **BigCommerce-hosted buyer portal** is the recommended approach
- **Official documentation** provides best practices
- **Community solutions** may cause conflicts

### 2. Keep It Simple
- **Avoid over-engineering** solutions
- **Use proven patterns** from official repos
- **Test thoroughly** before implementing complex features

### 3. Document Everything
- **Comprehensive documentation** saves time
- **Troubleshooting guides** help future implementations
- **Clear setup instructions** reduce support requests

### 4. Version Control Best Practices
- **Clean commit history** with descriptive messages
- **Proper branch management** for different environments
- **Regular backups** and repository synchronization

## 📞 Support and Resources

### Official Documentation
- [BigCommerce B2B Documentation](https://developer.bigcommerce.com/docs/b2b)
- [B2B Buyer Portal Guide](https://support.bigcommerce.com/s/article/B2B-Buyer-Portal)
- [Catalyst Documentation](https://catalyst.dev/)

### Community Resources
- [BigCommerce Developer Community](https://developer.bigcommerce.com/community)
- [GitHub Discussions](https://github.com/bigcommerce/catalyst/discussions)

### Debug Tools
- **B2B Debug Pages**: `/b2b-debug`, `/business-test`
- **Console Logging**: Comprehensive debug information
- **Environment Checks**: Validation of configuration

---

**Remember:** This troubleshooting guide should be updated as new issues are discovered and resolved. Keep it current for future implementations! 