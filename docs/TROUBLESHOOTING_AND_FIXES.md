# 🚨 Troubleshooting and Fixes: The Complete Guide

Hey there! 👋 So you're running into some issues with your BigCommerce Catalyst B2B and Algolia integration? Don't worry - we've been there! This guide covers every problem we encountered during development and exactly how we fixed them.

## 🎯 What This Guide Covers

This isn't your typical troubleshooting guide. We're sharing **real problems we actually solved** during development, including:

- **B2B route conflicts** that caused 404 errors
- **Algolia environment variable issues** that broke search
- **Middleware issues** that broke everything
- **Import path problems** that drove us crazy
- **Cart synchronization failures** that seemed impossible to fix
- **Search form submission issues** that were frustrating
- **Facet selection problems** that needed fixing
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

### Issue 2: Algolia Environment Variable Naming Conflicts

**The Problem:**
After upgrading to Catalyst 1.1.0, Algolia search stopped working due to environment variable naming conflicts.

**What Was Happening:**
- Old environment variables used `NEXT_PUBLIC_` prefix
- New Catalyst version expected standard Algolia variable names
- Search functionality completely broken

**The Solution:**
We **updated all environment variables** to use the standard Algolia naming convention:

```env
# OLD (BROKEN)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_APP_KEY=your_algolia_search_api_key
NEXT_PUBLIC_ALGOLIA_INDEXNAME=your_algolia_index_name

# NEW (WORKING)
ALGOLIA_APPLICATION_ID=your_algolia_app_id
ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
ALGOLIA_INDEX_NAME=your_algolia_index_name
```

**Files We Changed:**
- `.env.local` - Updated environment variable names
- `core/lib/algolia/client.ts` - Updated to use new variable names
- `core/lib/algolia/faceted-search.ts` - Updated all references
- `core/lib/algolia.ts` - Updated error messages
- `core/client/queries/get-search-results.ts` - Updated variable references

**Lesson Learned:** Always check environment variable naming conventions when upgrading frameworks!

### Issue 3: Search Form Submission Not Working

**The Problem:**
Users could type in the search box, but hitting enter or clicking the search button did nothing.

**What Was Happening:**
- Search form was preventing default submission
- Form action wasn't properly configured
- Missing `getFormProps` and `action={formAction}` setup

**The Solution:**
We **fixed the search form configuration** in the navigation component:

```tsx
// Fixed search form in navigation/index.tsx
<form
  {...getFormProps(form)}
  onSubmit={handleSubmit}
  className="nav-search-form flex items-center gap-3 px-3 py-3 @4xl:px-5 @4xl:py-4 bg-white rounded-lg border border-gray-200"
>
  {/* form content */}
</form>
```

**Key Changes:**
- Added `{...getFormProps(form)}` to the form element
- Set `onSubmit={handleSubmit}` for proper form handling
- Added white background styling for better visibility

**Lesson Learned:** Form submission in React requires proper configuration with Conform!

### Issue 4: Facet Selection Not Working

**The Problem:**
Facet filters weren't working - clicking on brand or category filters did nothing.

**What Was Happening:**
- URL parameters were being treated as single strings instead of arrays
- Facet selection logic expected arrays but received strings
- TypeScript errors about `brand.map is not a function`

**The Solution:**
We **fixed the parameter handling** to support both single values and arrays:

```typescript
// Fixed parameter parsing in search page
const search = await fetchAlgoliaFacetedSearch({
  term: searchParams.term as string || '',
  page: parseInt(searchParams.page as string) || 0,
  limit: parseInt(searchParams.limit as string) || 12,
  sort: searchParams.sort as any,
  brand: Array.isArray(searchParams.brand) ? searchParams.brand : searchParams.brand ? [searchParams.brand as string] : undefined,
  categoryIn: Array.isArray(searchParams.categoryIn) ? searchParams.categoryIn : searchParams.categoryIn ? [searchParams.categoryIn as number] : undefined,
  // ... other parameters
});
```

**Files We Changed:**
- `core/app/[locale]/(default)/(faceted)/search/page.tsx` - Fixed parameter parsing
- `core/lib/algolia/faceted-search.ts` - Updated interface and handling

**Lesson Learned:** URL parameters can be single values or arrays - handle both cases!

### Issue 5: Search Results Styling Issues

**The Problem:**
Search results were hard to read with black text on dark backgrounds.

**What Was Happening:**
- Search results had no background styling
- Type-ahead results were invisible
- Poor contrast made text unreadable

**The Solution:**
We **added comprehensive styling** for search results:

```css
/* Added to globals.css */
:root {
  --nav-search-background: hsl(0 0% 100%);
  --nav-search-border: hsl(0 0% 90%);
  --nav-search-divider: hsl(0 0% 90%);
  /* ... more variables */
}
```

**Files We Changed:**
- `core/app/globals.css` - Added search styling variables
- `core/vibes/soul/primitives/navigation/index.tsx` - Added white backgrounds to search results

**Lesson Learned:** Always consider contrast and readability in search interfaces!

### Issue 6: B2B Token Generation Missing

**The Problem:**
B2B customers could log in but had no B2B token, so B2B features weren't available.

**What Was Happening:**
- B2B token generation wasn't added to the auth flow
- JWT callbacks weren't handling B2B token creation
- Session lacked B2B capabilities

**The Solution:**
We **added B2B token generation** to the auth system:

```typescript
// Added to auth/index.ts
export async function generateB2BToken(customerId: number): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.B2B_API_HOST}/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/customers/${customerId}/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.B2B_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data.token;
    }
    return null;
  } catch (error) {
    console.error('B2B token generation failed:', error);
    return null;
  }
}
```

**Files We Changed:**
- `core/auth/index.ts` - Added B2B token generation
- `core/auth/customer-login-api.ts` - Updated to include B2B token in session

**Lesson Learned:** B2B functionality requires explicit token generation in the auth flow!

### Issue 7: Middleware Issues Causing 404s

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

### Issue 8: Import Path Resolution Errors

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

### Issue 9: Cart Synchronization Issues

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

### Issue 10: Missing B2B Hook Files

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

### Issue 11: Locale Routing Conflicts

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

# Algolia Configuration - UPDATED NAMES
ALGOLIA_APPLICATION_ID=your_algolia_app_id
ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
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
2. **Set up facets**: `categories_without_path`, `brand_name`, `default_price`, `in_stock`, `is_visible`
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

console.log('🔍 [Algolia] Environment check:', {
  appId: process.env.ALGOLIA_APPLICATION_ID ? 'SET' : 'NOT SET',
  appKey: process.env.ALGOLIA_SEARCH_API_KEY ? 'SET' : 'NOT SET',
  indexName: process.env.ALGOLIA_INDEX_NAME ? 'SET' : 'NOT SET',
  nodeEnv: process.env.NODE_ENV
});
```

### Strategy 2: Debug Pages
We created debug pages to monitor functionality:

```bash
# B2B Debug Page
http://localhost:3000/b2b-debug

# Business Test Page
http://localhost:3000/business-test

# Algolia Debug (via console logs)
npm run algolia:debug
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
      ALGOLIA_APPLICATION_ID: z.string(),
      ALGOLIA_SEARCH_API_KEY: z.string(),
      ALGOLIA_INDEX_NAME: z.string(),
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

### Lesson 6: Form Submission Requires Proper Setup
React forms need proper configuration with libraries like Conform.

### Lesson 7: Styling Matters for UX
Search interfaces need proper contrast and readability.

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

### Step 5: Test Search Functionality
```bash
# Test search API
curl "http://localhost:3000/search?term=plant"

# Check Algolia connection
npm run algolia:debug
```

### Step 6: Create a GitHub Issue
If you're still stuck, create an issue in this repository. We'll help you fix it!

## 🎉 Success Stories

### What We Built
- **Complete B2B integration** that actually works
- **Lightning-fast Algolia search** with faceted filtering
- **Production-ready deployment** on Vercel
- **Comprehensive debugging tools** for troubleshooting
- **Complete documentation** for future developers

### What Others Can Learn
- **Start with official approaches** - Don't reinvent the wheel
- **Build debug tools early** - They'll save you hours of troubleshooting
- **Document everything** - Future you will thank you
- **Test thoroughly** - Production issues are expensive
- **Pay attention to environment variables** - They're often the root cause

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