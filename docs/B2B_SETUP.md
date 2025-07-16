# B2B Buyer Portal Integration Setup Guide

This guide walks you through setting up BigCommerce B2B buyer portal integration for your Catalyst storefront, including quotes, shopping lists, and cart synchronization.

## Overview

This implementation uses the **BigCommerce-hosted B2B buyer portal** approach, which is the officially recommended method. The buyer portal is a separate application that integrates seamlessly with your Catalyst storefront.

## Prerequisites

- BigCommerce store with B2B features enabled
- B2B API access and credentials
- Node.js 18+ installed
- Catalyst storefront setup

## Step 1: BigCommerce B2B Configuration

### 1.1 Enable B2B Features
1. In your BigCommerce admin, go to **Settings** → **Store Setup** → **B2B**
2. Enable **B2B Features**
3. Configure customer groups for B2B customers
4. Set up pricing rules and discounts

### 1.2 Get B2B API Credentials
1. Go to **Settings** → **API** → **B2B API**
2. Note down your **B2B API Token**
3. The B2B API host is typically: `https://api-b2b.bigcommerce.com/`

## Step 2: Environment Configuration

### 2.1 Add B2B Environment Variables
Add these to your `.env.local` file:

```env
# B2B Configuration
B2B_API_TOKEN=your_b2b_api_token_here
B2B_API_HOST=https://api-b2b.bigcommerce.com/
```

### 2.2 Complete Environment Setup
Your full `.env.local` should include:

```env
# BigCommerce Configuration
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_CLIENT_ID=your_client_id
BIGCOMMERCE_CLIENT_SECRET=your_client_secret
BIGCOMMERCE_ACCESS_TOKEN=your_access_token

# Algolia Configuration (if using search)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
ALGOLIA_INDEX_NAME=your_algolia_index_name

# B2B Configuration
B2B_API_TOKEN=your_b2b_api_token
B2B_API_HOST=https://api-b2b.bigcommerce.com/
```

## Step 3: B2B Integration Components

### 3.1 B2B Loader Script
The B2B loader (`core/b2b/loader.tsx`) handles:
- B2B authentication
- Session management
- Cart synchronization
- User state management

### 3.2 B2B Authentication
The authentication system (`core/b2b/use-b2b-auth.ts`) provides:
- Customer login/logout
- Session validation
- Token management
- User profile access

### 3.3 Cart Synchronization
Cart sync (`core/b2b/use-b2b-cart.ts`) ensures:
- Cart ID synchronization between buyer portal and Catalyst
- Real-time cart updates
- Cross-platform cart consistency

### 3.4 Product Actions
Product detail actions (`core/vibes/soul/sections/product-detail/ProductDetailB2BActions.tsx`) include:
- Add to Quote functionality
- Add to Shopping List
- B2B-specific product options

## Step 4: B2B Features Implementation

### 4.1 Quotes System
The quotes system allows B2B customers to:
- Create quotes for products
- Add multiple products to quotes
- Manage quote status
- Convert quotes to orders

**Key Files:**
- `core/b2b/use-b2b-quote-enabled.ts`
- `core/b2b/use-product-details.tsx`

### 4.2 Shopping Lists
Shopping lists enable B2B customers to:
- Create and manage shopping lists
- Add products to lists
- Share lists with team members
- Convert lists to orders

**Key Files:**
- `core/b2b/use-b2b-shopping-list-enabled.ts`
- `core/b2b/use-product-details.tsx`

### 4.3 Product Options Mapping
B2B product options (`core/b2b/map-to-b2b-product-options.tsx`) handle:
- Product variant selection
- B2B-specific pricing
- Inventory management
- Custom options

## Step 5: Testing B2B Features

### 5.1 Authentication Testing
1. **Login Flow**: Test B2B customer login
2. **Session Management**: Verify session persistence
3. **Logout**: Test proper session cleanup
4. **Token Validation**: Check B2B token handling

### 5.2 Cart Synchronization Testing
1. **Add to Cart**: Add products in buyer portal
2. **Cart Sync**: Verify cart appears in Catalyst
3. **Remove Items**: Test item removal sync
4. **Quantity Updates**: Test quantity changes

### 5.3 Quote Management Testing
1. **Create Quote**: Add products to quote
2. **Quote Management**: Access quote dashboard
3. **Quote to Order**: Convert quote to order
4. **Quote History**: View past quotes

### 5.4 Shopping List Testing
1. **Create List**: Create new shopping list
2. **Add Products**: Add items to list
3. **List Management**: Edit and delete lists
4. **List to Cart**: Convert list to cart

### 5.5 Product Detail Testing
1. **B2B Actions**: Test "Add to Quote" and "Add to Shopping List" buttons
2. **Product Options**: Test B2B-specific options
3. **Pricing Display**: Verify B2B pricing
4. **Inventory Status**: Check stock levels

## Step 6: Debugging and Monitoring

### 6.1 Debug Components
Use the debug components to monitor B2B functionality:

```bash
# Access debug page
http://localhost:3000/b2b-debug

# Check customer debug info
http://localhost:3000/business-test
```

### 6.2 Console Logging
The B2B loader provides detailed logging:
- Session status
- Authentication state
- Cart synchronization
- API responses

### 6.3 Common Debug Information
Look for these log entries:
```
B2BLoader session: {
  hasSession: true,
  hasUser: true,
  hasB2bToken: true,
  b2bTokenLength: 280,
  cartId: 'cart-id-here',
  userEmail: 'user@example.com'
}
```

## Step 7: Production Deployment

### 7.1 Environment Variables
Ensure all B2B environment variables are set in production:
- `B2B_API_TOKEN`
- `B2B_API_HOST`

### 7.2 Buyer Portal URL
The buyer portal URL is automatically configured:
- Development: `https://buyer-portal.bigcommerce.com/`
- Production: `https://buyer-portal.bigcommerce.com/`

### 7.3 SSL and Security
- Ensure HTTPS is enabled
- Verify API token security
- Monitor API usage

## Troubleshooting

### Common Issues

#### 1. "B2B API Token not found"
- Verify `B2B_API_TOKEN` is set in environment
- Check token permissions in BigCommerce admin
- Ensure token hasn't expired

#### 2. "B2B authentication failed"
- Verify customer credentials
- Check B2B API host configuration
- Ensure customer has B2B permissions

#### 3. "Cart synchronization not working"
- Check B2B loader implementation
- Verify cart ID cookie handling
- Ensure buyer portal is properly configured

#### 4. "Quote/Shopping List features not available"
- Verify B2B features are enabled in BigCommerce
- Check customer group permissions
- Ensure proper API access

### Debug Commands

```bash
# Test B2B connection
npm run b2b:test

# Check environment variables
npm run env:check

# Debug B2B session
npm run b2b:debug
```

## Performance Optimization

### 1. Session Management
- Implement proper session caching
- Optimize token refresh logic
- Minimize API calls

### 2. Cart Synchronization
- Use efficient cart sync mechanisms
- Implement proper error handling
- Optimize cross-platform communication

### 3. API Optimization
- Cache B2B API responses
- Implement request batching
- Monitor API rate limits

## Security Best Practices

### 1. API Security
- Keep B2B API tokens secure
- Use environment variables
- Rotate tokens regularly

### 2. Session Security
- Implement proper session validation
- Use secure cookie settings
- Monitor for suspicious activity

### 3. Data Protection
- Encrypt sensitive B2B data
- Implement proper access controls
- Follow data privacy regulations

## Integration with Other Features

### Algolia Search Integration
B2B features work seamlessly with Algolia search:
- Search results show B2B pricing
- Faceted search includes B2B filters
- Product actions available on search results

### Makeswift Integration
B2B components integrate with Makeswift:
- Product detail pages include B2B actions
- Custom B2B components available
- Responsive design maintained

## Support and Resources

### Documentation
- [BigCommerce B2B Documentation](https://developer.bigcommerce.com/docs/b2b)
- [B2B Buyer Portal Guide](https://support.bigcommerce.com/s/article/B2B-Buyer-Portal)
- [Catalyst Documentation](https://catalyst.dev/)

### Community
- [BigCommerce Developer Community](https://developer.bigcommerce.com/community)
- [GitHub Discussions](https://github.com/bigcommerce/catalyst/discussions)

---

**Need help?** Create an issue in this repository or contact the development team. 