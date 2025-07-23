# 🏢 B2B Buyer Portal Integration: The Complete Guide

Hey there! 👋 So you want to add B2B functionality to your BigCommerce Catalyst storefront? You've come to the right place! This guide will walk you through everything you need to know to get B2B buyer portal integration working like a charm.

## 🎯 What You're Building

You're about to add **BigCommerce's official B2B buyer portal** to your Catalyst storefront. This gives your B2B customers access to:

- **Quote management** - Create, manage, and convert quotes to orders
- **Shopping lists** - Perfect for team collaboration and bulk ordering  
- **Cart synchronization** - Seamless cart sync between buyer portal and your storefront
- **B2B pricing** - Customer-specific pricing and discounts
- **Product actions** - "Add to Quote" and "Add to Shopping List" buttons

## 🚨 Important: Why This Approach Works

We tried a bunch of different approaches and here's what we learned:

### ❌ What Doesn't Work
- **Custom B2B implementations** - Too complex, too many edge cases
- **Direct B2B API integration** - Missing critical features, hard to maintain
- **Third-party B2B solutions** - Expensive, not well integrated

### ✅ What Actually Works
- **BigCommerce-hosted buyer portal** - Official, supported, feature-complete
- **Official B2B integration** - All the features you need, properly tested
- **This implementation** - Production-ready, battle-tested, actually works

## 🛠️ Prerequisites (What You Need Before Starting)

### BigCommerce Store Setup
- **B2B features enabled** in your BigCommerce admin
- **B2B API access** with proper credentials
- **Customer groups configured** for B2B customers
- **Pricing rules set up** for B2B discounts

### Development Environment
- **Node.js 18+** (because we're not living in the past)
- **BigCommerce store** with API access
- **Environment variables** properly configured

## 🚀 Step-by-Step Setup

### Step 1: Enable B2B Features in BigCommerce

1. **Go to your BigCommerce admin**
2. **Navigate to Settings → Store Setup → B2B**
3. **Enable B2B Features** (this is the magic switch!)
4. **Configure customer groups** for B2B customers
5. **Set up pricing rules** and discounts

**Pro Tip:** Make sure you have at least one customer group set up for B2B customers. This is crucial for the integration to work properly.

### Step 2: Get Your B2B API Credentials

1. **Go to Settings → API → B2B API**
2. **Copy your B2B API Token** (keep this safe - you'll need it!)
3. **Note the B2B API host**: `https://api-b2b.bigcommerce.com/`

**Important:** The B2B API token is different from your regular BigCommerce API token. You need both!

### Step 3: Configure Your Environment Variables

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

### Step 4: Install the B2B Integration

The B2B integration is already included in this repository. Here's what you get:

```
core/b2b/
├── loader.tsx                     # B2B loader script
├── use-b2b-auth.ts                # B2B authentication
├── use-b2b-cart.ts                # Cart synchronization
├── use-product-details.tsx        # Product actions
├── use-b2b-quote-enabled.ts       # Quote functionality
├── use-b2b-shopping-list-enabled.ts # Shopping list functionality
└── map-to-b2b-product-options.tsx # Product options mapping
```

### Step 5: Add B2B Loader to Your Layout

The B2B loader needs to be added to your locale layout. It's already configured in:

```tsx
// core/app/[locale]/layout.tsx
import { B2BLoader } from '~/b2b/loader';

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <B2BLoader />
        {children}
      </body>
    </html>
  );
}
```

### Step 6: Test Your B2B Integration

Use these debug pages to make sure everything's working:

```bash
# Check the B2B debug page
http://localhost:3000/b2b-debug

# Check customer debug info
http://localhost:3000/business-test
```

## 🔧 How the B2B Integration Works

### B2B Authentication Flow

1. **Customer logs in** to your Catalyst storefront
2. **B2B token is generated** automatically during login via JWT callbacks
3. **Session is established** with B2B capabilities
4. **Customer can access** B2B features (quotes, shopping lists, etc.)

### Cart Synchronization

The B2B integration handles cart sync automatically:

1. **Customer adds items** to cart in buyer portal
2. **Cart ID is synchronized** between buyer portal and Catalyst
3. **Real-time updates** ensure consistency across platforms
4. **No manual intervention** required

### Product Actions

B2B customers get special product actions:

- **Add to Quote** - Add products to quotes for approval
- **Add to Shopping List** - Add products to shopping lists
- **B2B pricing** - See customer-specific pricing
- **Bulk operations** - Add multiple items at once

### Search Integration

B2B customers get enhanced search capabilities:

- **B2B-aware search results** - Shows B2B pricing in search
- **Faceted search** - Filter by category, brand, price, stock
- **Type-ahead search** - Instant search suggestions
- **Mobile-optimized** - Great search experience on all devices

## 🧪 Testing Your B2B Setup

### Authentication Testing

1. **Login Flow**
   - Test B2B customer login
   - Verify B2B token generation (check console logs)
   - Check session persistence

2. **Session Management**
   - Verify session doesn't expire unexpectedly
   - Test logout functionality
   - Check token refresh

### Cart Synchronization Testing

1. **Add to Cart**
   - Add products in buyer portal
   - Verify cart appears in Catalyst
   - Test quantity updates

2. **Cart Management**
   - Remove items from cart
   - Update quantities
   - Verify sync across platforms

### Quote Management Testing

1. **Create Quote**
   - Add products to quote
   - Verify quote creation
   - Check quote status

2. **Quote Operations**
   - Access quote dashboard
   - Convert quote to order
   - View quote history

### Shopping List Testing

1. **Create List**
   - Create new shopping list
   - Add products to list
   - Share list with team

2. **List Management**
   - Edit shopping lists
   - Delete lists
   - Convert list to cart

### Search Integration Testing

1. **B2B Search Results**
   - Search for products as B2B customer
   - Verify B2B pricing appears in results
   - Test faceted search functionality

2. **Type-ahead Search**
   - Test header search bar
   - Verify instant results with white background
   - Check search form submission (enter key and button clicks)

## 🚨 Common Issues and How to Fix Them

### Issue 1: "B2B API Token not found"

**Symptoms:**
- B2B features not working
- Console errors about missing token
- Authentication failures

**Solution:**
```env
# Make sure this is in your .env.local
B2B_API_TOKEN=your_actual_b2b_api_token_here
```

**Pro Tip:** The B2B API token is different from your regular BigCommerce API token. You need both!

### Issue 2: "B2B authentication failed"

**Symptoms:**
- Customer login fails
- B2B token not generated
- Session issues

**Solution:**
1. Verify B2B features are enabled in BigCommerce admin
2. Check customer has B2B permissions
3. Ensure B2B API host is correct: `https://api-b2b.bigcommerce.com/`
4. Check that B2B token generation is added to auth callbacks

### Issue 3: "Cart synchronization not working"

**Symptoms:**
- Cart doesn't sync between buyer portal and Catalyst
- Items added in portal don't appear in storefront
- Cart ID mismatches

**Solution:**
1. Check B2B loader implementation
2. Verify cart ID cookie handling
3. Ensure buyer portal is properly configured

### Issue 4: "Quote/Shopping List features not available"

**Symptoms:**
- B2B buttons not showing
- Quote features disabled
- Shopping list functionality missing

**Solution:**
1. Verify B2B features are enabled in BigCommerce
2. Check customer group permissions
3. Ensure proper API access

### Issue 5: "B2B token not generating during login"

**Symptoms:**
- Customer logs in but no B2B token
- B2B features not available after login
- Console shows missing B2B token

**Solution:**
1. Check that B2B token generation is added to JWT callbacks
2. Verify B2B API credentials are correct
3. Ensure customer has B2B permissions
4. Check console logs for B2B token generation

## 🔍 Debugging Your B2B Setup

### Debug Components

Use these debug pages to troubleshoot:

```bash
# B2B Debug Page - Shows all B2B configuration
http://localhost:3000/b2b-debug

# Business Test Page - Shows customer-specific info
http://localhost:3000/business-test
```

### Console Logging

The B2B loader provides detailed logging. Look for:

```javascript
B2BLoader session: {
  hasSession: true,
  hasUser: true,
  hasB2bToken: true,
  b2bTokenLength: 280,
  cartId: 'cart-id-here',
  userEmail: 'user@example.com'
}
```

### Environment Variable Check

Run this to verify your environment variables:

```bash
npm run env:check
```

## 🚀 Production Deployment

### Vercel Environment Variables

Make sure these are set in your Vercel project:

```env
# BigCommerce Configuration
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_CLIENT_ID=your_client_id
BIGCOMMERCE_CLIENT_SECRET=your_client_secret
BIGCOMMERCE_ACCESS_TOKEN=your_access_token

# B2B Configuration
B2B_API_TOKEN=your_b2b_api_token
B2B_API_HOST=https://api-b2b.bigcommerce.com/

# Algolia Configuration
ALGOLIA_APPLICATION_ID=your_algolia_app_id
ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
ALGOLIA_INDEX_NAME=your_algolia_index_name
```

### SSL and Security

- **Enable HTTPS** - B2B integration requires secure connections
- **Verify API token security** - Keep tokens secure and rotate regularly
- **Monitor API usage** - Watch for unusual activity

### Buyer Portal URL

The buyer portal URL is automatically configured:
- **Development**: `https://buyer-portal.bigcommerce.com/`
- **Production**: `https://buyer-portal.bigcommerce.com/`

## 📊 Performance Optimization

### Session Management

- **Implement proper session caching** - Don't regenerate tokens unnecessarily
- **Optimize token refresh logic** - Only refresh when needed
- **Minimize API calls** - Cache responses where possible

### Cart Synchronization

- **Use efficient cart sync mechanisms** - Don't sync unnecessarily
- **Implement proper error handling** - Graceful degradation
- **Optimize cross-platform communication** - Minimize latency

## 🎯 What Makes This Implementation Special

### Why This Works When Others Don't

1. **Official BigCommerce Approach** - Uses the officially supported method
2. **Production Tested** - Actually deployed and working in production
3. **Complete Implementation** - All the features you need, properly integrated
4. **Battle Tested** - We've encountered and solved all the common issues

### Key Features That Matter

- **Automatic B2B token generation** - No manual token management
- **Seamless cart synchronization** - Works across buyer portal and storefront
- **Proper error handling** - Graceful degradation when things go wrong
- **Debug tools included** - Easy troubleshooting when you need it
- **Search integration** - B2B-aware search with faceted filtering
- **Mobile optimization** - Great experience on all devices

## 🆘 Getting Help

### When Things Go Wrong

1. **Check the debug pages** - They'll tell you what's wrong
2. **Look at the console logs** - Detailed error information
3. **Verify environment variables** - Most issues are configuration-related
4. **Check BigCommerce admin** - Ensure B2B features are enabled

### Common Debug Commands

```bash
# Test B2B connection
npm run b2b:test

# Check environment variables
npm run env:check

# Debug B2B session
npm run b2b:debug
```

## 🎉 You're All Set!

Congratulations! You now have a fully functional B2B buyer portal integration. Your B2B customers can:

- ✅ **Create and manage quotes**
- ✅ **Use shopping lists for team collaboration**
- ✅ **Enjoy seamless cart synchronization**
- ✅ **Access customer-specific pricing**
- ✅ **Use bulk ordering features**
- ✅ **Search products with B2B pricing**
- ✅ **Use faceted search and filtering**
- ✅ **Enjoy mobile-optimized experience**

### Next Steps

1. **Test everything thoroughly** - Use the debug pages
2. **Train your B2B customers** - Show them the new features
3. **Monitor performance** - Watch for any issues
4. **Gather feedback** - Improve based on customer needs

### Need More Help?

- **Check the troubleshooting guide** - [Troubleshooting and Fixes](TROUBLESHOOTING_AND_FIXES.md)
- **Review the Algolia setup** - [Algolia Setup Guide](ALGOLIA_SETUP.md)
- **Create GitHub issues** - We'll help you fix any problems

---

**Happy B2B selling! 🚀**

*P.S. If this guide helped you get B2B working, consider giving the repo a star! ⭐* 