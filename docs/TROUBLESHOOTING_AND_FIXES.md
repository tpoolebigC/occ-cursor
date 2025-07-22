# 🚨 Troubleshooting and Fixes: The Complete Guide

Hey there! 👋 So you're running into some issues with your BigCommerce Catalyst B2B integration? Don't worry - we've been there! This guide covers every problem we encountered during development and exactly how we fixed them.

## 🎯 What This Guide Covers

This isn't your typical troubleshooting guide. We're sharing **real problems we actually solved** during development, including:

- **B2B route conflicts** that caused 404 errors
- **Middleware issues** that broke everything
- **Import path problems** that drove us crazy
- **Cart synchronization failures** that seemed impossible to fix
- **Environment validation issues** that were sneaky
- **And much more!**

## 🚨 Critical Issues and Fixes (The Big Ones)

### Issue 1: B2B Route Conflicts and 404 Errors

**The Problem:** 
We implemented a custom B2B buyer portal and everything was returning 404 errors. It was a nightmare!

**What Was Happening:**
- Route conflicts between our custom B2B implementation and BigCommerce's official buyer portal
- Middleware exclusions not properly configured
- Locale routing conflicts making everything worse

**The Solution:**
We **switched to BigCommerce's official buyer portal approach**. Here's what we did:

```bash
# Removed our custom B2B routes (they were causing conflicts)
rm -rf core/app/[locale]/(default)/b2b/
rm -rf core/app/[locale]/(default)/business/

# Kept the official B2B integration
# core/b2b/ - This is the good stuff!
```

**Why This Works:**
- **Official approach** - BigCommerce supports this method
- **No route conflicts** - Uses their hosted portal instead of custom routes
- **Feature complete** - All the B2B features you need
- **Properly tested** - Actually works in production

**Lesson Learned:** Don't fight BigCommerce's official approach. Use their hosted buyer portal - it's way easier!

### Issue 2: Middleware Issues Causing 404s

**The Problem:**
Our middleware wasn't calling `NextResponse.next()` properly, causing all sorts of weird routing issues.

**What Was Happening:**
- Locale redirect middleware not handling all cases
- Missing `NextResponse.next()` calls in middleware chain
- Middleware breaking the entire routing system

**The Solution:**
```typescript
// Fixed middleware.ts
export function middleware(request: NextRequest) {
  // ... existing logic ...
  
  // Always call next() at the end - this was the key!
  return NextResponse.next();
}
```

**Files We Changed:**
- `core/middleware.ts` - Fixed the middleware chain
- `core/middlewares/with-intl.ts` - Disabled locale enforcement for development

**Lesson Learned:** Always call `NextResponse.next()` in your middleware, or everything breaks!

### Issue 3: Import Path Resolution Errors

**The Problem:**
Module not found errors for B2B hooks were driving us crazy. The import paths were wrong!

**What Was Happening:**
- Incorrect relative import paths
- Component location vs B2B hooks location mismatch
- TypeScript couldn't find the modules

**The Solution:**
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

**Files We Changed:**
- `core/vibes/soul/sections/product-detail/ProductDetailB2BActions.tsx`

**Lesson Learned:** Count your directory levels carefully when writing import paths!

### Issue 4: Cart Synchronization Issues

**The Problem:**
Cart sync from buyer portal wasn't working despite success messages. We had a complex API-based solution that was over-engineered.

**What Was Happening:**
- Complex API-based cart sync implementation
- Missing event handling for cart updates
- Over-engineered solution that was fragile

**The Solution:**
We **adopted the official approach** from BigCommerce's B2B repo:

```typescript
// Official approach in use-b2b-cart.ts
const handleCartCreated = (event: any) => {
  const cartId = event.detail.cartId;
  document.cookie = `cartId=${cartId}; path=/; max-age=31536000`;
  window.location.reload();
};
```

**Files We Changed:**
- `core/b2b/use-b2b-cart.ts` - Simplified to official approach
- Removed: `core/app/api/b2b/cart-sync/route.ts` (our complex API)

**Lesson Learned:** Sometimes the simple solution is the best solution. Don't over-engineer!

### Issue 5: Missing B2B Hook Files

**The Problem:**
Module not found errors for B2B functionality because we were missing critical files.

**What Was Happening:**
- Missing B2B hook files from official implementation
- Incomplete B2B integration
- TypeScript errors everywhere

**The Solution:**
We **copied all the missing files** from the official BigCommerce B2B repo:

**Files We Added:**
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

**Lesson Learned:** Don't try to reinvent the wheel. Use the official implementation!

### Issue 6: Locale Routing Conflicts

**The Problem:**
Locale enforcement was causing routing issues and conflicts with B2B routes.

**What Was Happening:**
- Locale redirect middleware too aggressive
- Conflicts with B2B routes
- Routing system breaking

**The Solution:**
We **disabled locale enforcement** for development and simplified routing:

**Files We Changed:**
- `core/middlewares/with-intl.ts` - Disabled locale enforcement
- `core/middleware.ts` - Simplified locale handling

**Lesson Learned:** Sometimes you need to simplify your routing to get things working!

## 🔧 Configuration Issues and Fixes

### Issue 1: Environment Variables Setup

**The Problem:**
Missing or incorrect environment variables causing all sorts of weird issues.

**The Solution:**
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

# B2B Configuration (CRITICAL!)
B2B_API_TOKEN=your_b2b_api_token
B2B_API_HOST=https://api-b2b.bigcommerce.com/
```

**Critical Note:** Make sure `B2B_API_TOKEN` is **required**, not optional. We learned this the hard way!

### Issue 2: B2B API Configuration

**The Problem:**
B2B API not properly configured, causing authentication failures.

**The Solution:**
1. **Enable B2B features** in BigCommerce admin
2. **Get B2B API token** from Settings → API → B2B API
3. **Configure customer groups** for B2B customers

**Pro Tip:** The B2B API token is different from your regular BigCommerce API token. You need both!

### Issue 3: Algolia Index Configuration

**The Problem:**
Algolia search not working properly due to incorrect index configuration.

**The Solution:**
1. **Configure searchable attributes**: `name`, `description`, `brand_name`, `categories_without_path`, `sku`
2. **Set up facets**: `categories_without_path`, `brand_name`, `default_price`, `in_stock`
3. **Index products** with proper data structure

## 🚀 Performance and Optimization Fixes

### Issue 1: Webpack Performance Warnings

**The Problem:**
Webpack cache serialization warnings cluttering the console.

**The Solution:**
- **Optimized bundle size** by removing unused dependencies
- **Configured proper caching** strategies
- **Used production builds** for deployment

### Issue 2: API Response Times

**The Problem:**
Slow API responses affecting user experience.

**The Solution:**
- **Implemented caching** for API responses
- **Optimized request batching** where possible
- **Used CDN** for static assets

## 🔍 Debugging Strategies (How We Found These Issues)

### Strategy 1: Console Logging
We added extensive console logging to track down issues:

```typescript
console.log('B2B Loader Debug:', {
  hasB2BApiHost: !!process.env.B2B_API_HOST,
  hasB2BApiToken: !!process.env.B2B_API_TOKEN,
  hasB2BToken: !!session?.b2bToken,
  session: session ? 'exists' : 'missing'
});
```

### Strategy 2: Debug Pages
We created debug pages to monitor functionality:

```bash
# B2B Debug Page
http://localhost:3000/b2b-debug

# Business Test Page
http://localhost:3000/business-test
```

### Strategy 3: Environment Variable Checks
We added environment variable validation:

```typescript
const ENV = z
  .object({
    env: z.object({
      B2B_API_TOKEN: z.string(), // Required, not optional!
      BIGCOMMERCE_CHANNEL_ID: z.string(),
      B2B_API_HOST: z.string().default('https://api-b2b.bigcommerce.com/'),
    }),
  })
  .transform(({ env }) => env);
```

## 🎯 Key Lessons Learned

### Lesson 1: Use Official Approaches
Don't fight BigCommerce's official methods. Their hosted buyer portal is way easier than custom implementations.

### Lesson 2: Keep It Simple
We over-engineered several solutions. The simple approach often works better.

### Lesson 3: Environment Variables Matter
Most issues were configuration-related. Double-check your environment variables!

### Lesson 4: Debug Tools Are Essential
Without our debug pages and console logging, we never would have found these issues.

### Lesson 5: Import Paths Are Tricky
Count your directory levels carefully when writing import paths!

## 🆘 When You're Still Stuck

### Step 1: Check the Debug Pages
```bash
http://localhost:3000/b2b-debug
http://localhost:3000/business-test
```

### Step 2: Look at Console Logs
Open your browser's developer tools and check the console for error messages.

### Step 3: Verify Environment Variables
```bash
npm run env:check
```

### Step 4: Check BigCommerce Admin
Make sure B2B features are enabled and properly configured.

### Step 5: Create a GitHub Issue
If you're still stuck, create an issue in this repository. We'll help you fix it!

## 🎉 Success Stories

### What We Built
- **Complete B2B integration** that actually works
- **Production-ready deployment** on Vercel
- **Comprehensive debugging tools** for troubleshooting
- **Complete documentation** for future developers

### What Others Can Learn
- **Start with official approaches** - Don't reinvent the wheel
- **Build debug tools early** - They'll save you hours of troubleshooting
- **Document everything** - Future you will thank you
- **Test thoroughly** - Production issues are expensive

## 📚 Additional Resources

### Documentation
- **[B2B Setup Guide](B2B_SETUP.md)** - Complete B2B setup instructions
- **[Algolia Setup Guide](ALGOLIA_SETUP.md)** - Algolia search integration
- **[BigCommerce B2B Documentation](https://developer.bigcommerce.com/docs/b2b)** - Official docs

### Community
- **[BigCommerce Developer Community](https://developer.bigcommerce.com/community)** - Get help from other developers
- **[GitHub Discussions](https://github.com/bigcommerce/catalyst/discussions)** - Ask questions

---

**Remember:** Every problem has a solution. We found them all, and now you don't have to! 🚀

*P.S. If this guide helped you fix your issues, consider giving the repo a star! ⭐* 