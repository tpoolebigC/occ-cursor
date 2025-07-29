# B2B Buyer Portal Setup Guide

This guide will help you set up the custom B2B buyer portal with real BigCommerce data and Algolia search integration.

## 🚀 **Features**

- **Real BigCommerce B2B Data**: Quotes, orders, customers, products
- **Algolia Search**: Fast product search for quick orders
- **Quick Order Form**: Search products and create orders/quotes
- **Performance Optimized**: SWR caching, optimized components
- **Responsive Design**: Works on all devices
- **Session-Based Authentication**: Uses existing B2B session tokens

## 📋 **Prerequisites**

1. BigCommerce store with B2B features enabled
2. Algolia account (for search functionality)
3. Environment variables configured

## 🔧 **Environment Variables**

Add these to your `.env.local` file:

```bash
# BigCommerce Store Configuration (REQUIRED)
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_STOREFRONT_TOKEN=your_storefront_token

# B2B API Configuration (OPTIONAL - for admin operations)
B2B_CLIENT_ID=your_b2b_client_id
B2B_CLIENT_SECRET=your_b2b_client_secret
B2B_API_TOKEN=your_b2b_api_token
B2B_API_HOST=https://api-b2b.bigcommerce.com
B2B_STOREFRONT_API_HOST=https://api.bigcommerce.com

# Algolia Configuration (OPTIONAL - for search functionality)
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_SEARCH_KEY=your_algolia_search_key
ALGOLIA_ADMIN_KEY=your_algolia_admin_key
ALGOLIA_INDEX_NAME=your_index_name

# Feature Flags
ENABLE_B2B_API=true
ENABLE_ALGOLIA_SEARCH=true
ENABLE_QUICK_ORDER=true
```

## 🔑 **Authentication Methods**

### Method 1: Session-Based (Recommended for B2B Users)
**No additional credentials needed!** If you're logged in as a B2B user, the portal will automatically use your existing session token to access B2B APIs.

**How it works:**
1. User logs in through the regular BigCommerce login
2. B2B session token is automatically available
3. Custom buyer portal uses this token for API calls
4. No additional setup required

### Method 2: API Token (For Admin Operations)
Only needed if you want to perform admin operations or access data for other users.

1. Go to your BigCommerce admin panel
2. Navigate to **Settings** → **API** → **API Accounts**
3. Create a new API account with B2B permissions
4. Copy the API token

### Method 3: OAuth App (For Third-Party Integrations)
Only needed for third-party integrations or custom applications.

1. Go to your BigCommerce admin panel
2. Navigate to **Settings** → **API** → **OAuth Apps**
3. Create a new OAuth app with B2B scopes
4. Copy the Client ID and Client Secret

## 🔍 **Setting Up Algolia**

### 1. Create Algolia Account
1. Sign up at [algolia.com](https://www.algolia.com)
2. Create a new application
3. Note your App ID, Search Key, and Admin Key

### 2. Create Search Indices
You'll need these indices for full functionality:

```bash
# Products index (for quick order search)
your_index_name_products

# Orders index (for order search)
your_index_name_orders

# Quotes index (for quote search)
your_index_name_quotes

# Invoices index (for invoice search)
your_index_name_invoices
```

### 3. Configure Index Settings
For each index, configure:

**Searchable Attributes:**
- Products: `name`, `sku`, `description`, `brand`
- Orders: `order_number`, `customer_name`, `customer_company`
- Quotes: `quote_number`, `customer_name`, `customer_company`
- Invoices: `invoice_number`, `order_number`, `customer_name`

**Filterable Attributes:**
- `customer_id`
- `status`
- `date_created`

**Sortable Attributes:**
- `date_created`
- `total_inc_tax`
- `name`

## 📊 **Data Indexing**

### 1. Index Products
```javascript
// Example: Index products from BigCommerce
const products = await b2bApiClient.getProducts({ limit: 1000 });
await b2bAlgoliaSearch.addToIndex('products', products.data);
```

### 2. Index Orders
```javascript
// Example: Index orders from BigCommerce
const orders = await b2bApiClient.getOrders({ limit: 1000 });
await b2bAlgoliaSearch.addToIndex('orders', orders.data);
```

### 3. Index Quotes
```javascript
// Example: Index quotes from BigCommerce
const quotes = await b2bApiClient.getQuotes({ limit: 1000 });
await b2bAlgoliaSearch.addToIndex('quotes', quotes.data);
```

## 🚀 **Usage**

### 1. Access the Portal
Navigate to `/custom-buyer-portal` in your browser.

### 2. Authentication Status
The portal will show one of these status indicators:
- **🟢 Real Data**: Successfully authenticated with B2B APIs
- **🟡 Mock Data**: Using fallback data (no B2B API access)
- **🔴 Error**: Configuration or authentication error

### 3. Dashboard
- View real-time stats
- See recent quotes and orders
- Monitor customer activity

### 4. Quick Order
- Search products using Algolia
- Add items to cart or create quotes
- Real-time product suggestions

### 5. Quotes Management
- View all quotes
- Filter by status
- Search quotes using Algolia

### 6. Orders Management
- Track order status
- View order history
- Search orders using Algolia

### 7. Customer Management
- View customer list
- Search customers
- Manage customer relationships

## 🔧 **Configuration Options**

### Feature Flags
```bash
# Enable/disable B2B API
ENABLE_B2B_API=true

# Enable/disable Algolia search
ENABLE_ALGOLIA_SEARCH=true

# Enable/disable quick order
ENABLE_QUICK_ORDER=true
```

### API Endpoints
```bash
# B2B API host (default: https://api-b2b.bigcommerce.com)
B2B_API_HOST=https://api-b2b.bigcommerce.com

# Storefront API host (default: https://api.bigcommerce.com)
B2B_STOREFRONT_API_HOST=https://api.bigcommerce.com
```

## 🐛 **Troubleshooting**

### Authentication Issues
1. **"B2B API is not configured"**
   - Check your `BIGCOMMERCE_STORE_HASH` and `BIGCOMMERCE_CHANNEL_ID`
   - Ensure B2B features are enabled in BigCommerce

2. **"No authentication method available"**
   - Make sure you're logged in as a B2B user
   - Check that your session token is valid
   - Verify B2B features are enabled

3. **"B2B API request failed"**
   - Check your store hash and channel ID
   - Ensure you have B2B permissions
   - Verify your session is still valid

### Algolia Issues
1. **"Algolia is not properly configured"**
   - Check your Algolia environment variables
   - Ensure indices exist

2. **Search not working**
   - Verify index settings
   - Check searchable attributes

### Performance Issues
1. **Slow loading**
   - Check network requests
   - Verify caching is working
   - Monitor Algolia response times

## 📈 **Performance Optimization**

### 1. Caching
- SWR hooks provide automatic caching
- 30-60 second cache intervals
- Deduplication of API calls

### 2. Search Optimization
- Debounced search (300ms)
- Limited results (10 per page)
- Highlighted search results

### 3. Bundle Optimization
- Code splitting by route
- Optimized imports
- Tree shaking

## 🔒 **Security**

### 1. Session Security
- Uses existing BigCommerce session tokens
- No additional credentials stored
- Automatic token refresh

### 2. API Security
- Session-based authentication
- User-scoped data access
- Proper error handling

### 3. Search Security
- Use search-only API keys
- Implement user-based filtering
- Sanitize search queries

## 📝 **API Reference**

### B2B API Client
```typescript
import { b2bApiClient } from '~/lib/b2b/api-client';

// Get quotes (uses session token automatically)
const quotes = await b2bApiClient.getQuotes({ limit: 20 });

// Get orders (uses session token automatically)
const orders = await b2bApiClient.getOrders({ limit: 20 });

// Get customers (uses session token automatically)
const customers = await b2bApiClient.getCustomers({ limit: 20 });

// Get products (uses session token automatically)
const products = await b2bApiClient.getProducts({ limit: 20 });

// Check authentication status
const canAuth = await b2bApiClient.canAuthenticate();

// Get current buyer info
const buyer = await b2bApiClient.getCurrentBuyer();
```

### Algolia Search
```typescript
import { b2bAlgoliaSearch } from '~/lib/algolia/b2b-search';

// Search products
const results = await b2bAlgoliaSearch.searchProducts('widget');

// Search orders
const orders = await b2bAlgoliaSearch.searchOrders('order-123');

// Search quotes
const quotes = await b2bAlgoliaSearch.searchQuotes('quote-456');

// Multi-index search
const all = await b2bAlgoliaSearch.searchAll('search term');
```

## 🎯 **Quick Start**

### For Logged-in B2B Users (No Setup Required!)
1. **Log in** to your BigCommerce store as a B2B user
2. **Navigate** to `/custom-buyer-portal`
3. **Start using** the portal immediately!

### For Developers/Admins
1. **Configure environment variables** (store hash, channel ID)
2. **Set up Algolia** (optional, for search)
3. **Test the portal**
4. **Customize as needed**

## 📞 **Support**

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Contact your BigCommerce representative
4. Check Algolia documentation

---

**Note**: This setup provides a foundation for a powerful B2B buyer portal. The key advantage is that **logged-in B2B users don't need any additional setup** - they can use the portal immediately with their existing session!

You can extend it with additional features like:
- Advanced analytics
- Bulk order processing
- Customer segmentation
- Automated workflows
- Integration with ERP systems 