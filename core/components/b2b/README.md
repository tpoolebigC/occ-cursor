# B2B Buyer Portal Integration

This directory contains the B2B (Business-to-Business) buyer portal integration for the Catalyst storefront.

## Overview

The B2B buyer portal provides additional functionality for B2B customers, including:
- Quote management
- Shopping lists
- B2B-specific pricing and discounts
- Enhanced order management

## Setup

### Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Required for B2B functionality
B2B_API_TOKEN=your_b2b_api_token_here
B2B_API_HOST=https://api-b2b.bigcommerce.com

# Optional: Use staging B2B CDN
STAGING_B2B_CDN_ORIGIN=false
```

### Authentication Flow

The B2B integration automatically:
1. Authenticates users with BigCommerce
2. Calls the B2B API to get a B2B token
3. Passes the B2B token to the buyer portal SDK
4. Handles B2B-specific callbacks and events

## Components

### B2BLoader
The main component that loads the B2B buyer portal script and configuration.

### B2BScript
Renders the B2B script tags and manages the B2B SDK integration.

### Hooks

- `useB2BAuth`: Handles B2B authentication and logout
- `useB2BCart`: Manages cart synchronization with the B2B portal
- `useSDK`: Provides access to the B2B SDK

## Usage

The B2B integration is automatically loaded in the default layout. No additional setup is required.

### Debugging

The `CustomerDebug` component can be added to any page to debug B2B integration issues:

```tsx
import { CustomerDebug } from '~/components/b2b/customer-debug';

// Add to your page component
<CustomerDebug />
```

## Troubleshooting

### Common Issues

1. **B2B token not available**: Check that `B2B_API_TOKEN` is set in your environment variables
2. **B2B script not loading**: Verify that `BIGCOMMERCE_STORE_HASH` and `BIGCOMMERCE_CHANNEL_ID` are correctly set
3. **Authentication failures**: Ensure the B2B API token has the correct permissions

### Debug Information

Check the browser console for debug logs from the B2B integration:
- `B2B Loader Debug`: Shows environment configuration
- `B2B Script Debug`: Shows script loading status
- `B2B Config loaded`: Confirms B3 configuration is set
- `B2B Script loaded successfully`: Confirms script loaded

## API Reference

### B2B SDK Methods

The B2B SDK provides the following methods:

```typescript
// User management
window.b2b.utils.user.loginWithB2BStorefrontToken(token)
window.b2b.utils.user.getProfile()
window.b2b.utils.user.getB2BToken()

// Cart management
window.b2b.utils.cart.getEntityId()
window.b2b.utils.cart.setEntityId(cartId)

// Quote management
window.b2b.utils.quote.getQuoteConfigs()
window.b2b.utils.quote.addProductsFromCartId(cartId)
window.b2b.utils.quote.addProducts(products)

// Shopping lists
window.b2b.utils.shoppingList.addProductFromPage(product)

// Navigation
window.b2b.utils.openPage(page)
```

### Events

The B2B SDK provides the following events:

```typescript
// Authentication events
window.b2b.callbacks.addEventListener('on-logout', callback)
window.b2b.callbacks.addEventListener('on-registered', callback)

// Cart events
window.b2b.callbacks.addEventListener('on-cart-created', callback)
``` 