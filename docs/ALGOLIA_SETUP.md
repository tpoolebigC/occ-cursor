# Algolia Search Integration Setup Guide

This guide walks you through setting up Algolia search integration for your BigCommerce Catalyst storefront.

## Prerequisites

- BigCommerce store with API access
- Algolia account (sign up at [algolia.com](https://www.algolia.com))
- Node.js 18+ installed

## Step 1: Algolia Account Setup

### 1.1 Create Algolia Account
1. Go to [algolia.com](https://www.algolia.com) and sign up
2. Choose the **Search** plan (free tier available)
3. Create a new application

### 1.2 Get Your Credentials
From your Algolia dashboard, note down:
- **Application ID** (App ID)
- **Search-Only API Key** (for frontend)
- **Admin API Key** (for indexing - keep secret)

## Step 2: Create Product Index

### 2.1 Create Index
1. In Algolia dashboard, go to **Search** → **Index**
2. Click **Create Index**
3. Name it `products` (or your preferred name)

### 2.2 Configure Searchable Attributes
Go to **Configuration** → **Searchable attributes** and add:
```
name
description
brand_name
categories_without_path
sku
```

### 2.3 Configure Facets
Go to **Configuration** → **Facets** and add:
```
categories_without_path
brand_name
default_price
in_stock
```

### 2.4 Configure Filterable Attributes
Go to **Configuration** → **Filterable attributes** and add:
```
category_ids
brand_name
default_price
in_stock
```

## Step 3: Index Your Products

### 3.1 Export Products from BigCommerce
You'll need to export your products from BigCommerce and format them for Algolia. Each product should have this structure:

```json
{
  "objectID": "product_id",
  "name": "Product Name",
  "brand_name": "Brand Name",
  "sku": "SKU123",
  "url": "/product-url/",
  "image_url": "https://cdn.example.com/image.jpg",
  "product_images": [...],
  "description": "Product description",
  "is_visible": true,
  "in_stock": true,
  "inventory": 10,
  "inventory_tracking": "product",
  "categories_without_path": ["Category 1", "Category 2"],
  "category_ids": [27, 28],
  "default_price": 80,
  "prices": {"USD": 80},
  "sales_prices": {"USD": 0},
  "retail_prices": {"USD": 0}
}
```

### 3.2 Upload to Algolia
1. Go to **Browse** in your Algolia index
2. Click **Upload records**
3. Upload your JSON file or paste records
4. Verify the data appears correctly

## Step 4: Environment Configuration

### 4.1 Create Environment File
Create a `.env.local` file in your project root:

```env
# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id_here
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_api_key_here
ALGOLIA_INDEX_NAME=products
```

### 4.2 BigCommerce Configuration
Add your BigCommerce credentials:

```env
# BigCommerce Configuration
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_CLIENT_ID=your_client_id
BIGCOMMERCE_CLIENT_SECRET=your_client_secret
BIGCOMMERCE_ACCESS_TOKEN=your_access_token
```

## Step 5: Test the Integration

### 5.1 Start Development Server
```bash
npm run dev
```

### 5.2 Test Search Functionality
1. **Quick Search**: Test the header search bar
2. **Full Search**: Visit `/search?term=product`
3. **Shop All**: Visit `/shop-all`
4. **Category Navigation**: Test category links
5. **Facets**: Apply filters and verify results

### 5.3 Debug Index Structure
Run the debug script to inspect your Algolia index:
```bash
npm run algolia:debug
```

## Step 6: Production Deployment

### 6.1 Environment Variables
Set the same environment variables in your production environment (Vercel, Netlify, etc.)

### 6.2 Build and Deploy
```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

#### 1. "Algolia environment variables not set"
- Ensure all Algolia environment variables are set
- Check that variable names match exactly

#### 2. "No search results"
- Verify your Algolia index has data
- Check that searchable attributes are configured
- Ensure your search terms match indexed data

#### 3. "Facets not appearing"
- Verify facets are configured in Algolia dashboard
- Check that facet attributes exist in your data
- Ensure facet names match exactly

#### 4. "Category navigation not working"
- Verify `category_ids` are indexed correctly
- Check that category filters are only applied when searching
- Ensure "Shop All" route is working

### Debug Commands

```bash
# Test Algolia connection
npm run algolia:debug

# Check environment variables
npm run env:check

# Test search functionality
npm run test:search
```

## Performance Optimization

### 1. Index Optimization
- Use appropriate searchable attributes
- Configure relevance settings
- Set up synonyms for better matching

### 2. Caching
- Enable Algolia's CDN
- Configure appropriate cache headers
- Use search result caching

### 3. Monitoring
- Set up Algolia Analytics
- Monitor search performance
- Track user behavior

## Security Best Practices

### 1. API Keys
- Use search-only API keys for frontend
- Keep admin API keys secure
- Rotate keys regularly

### 2. Input Validation
- Sanitize all search inputs
- Validate filter parameters
- Prevent injection attacks

### 3. Rate Limiting
- Configure appropriate rate limits
- Monitor API usage
- Set up alerts for unusual activity

## Support

For additional help:
- [Algolia Documentation](https://www.algolia.com/doc/)
- [BigCommerce Developer Docs](https://developer.bigcommerce.com/)
- [Catalyst Documentation](https://catalyst.dev/)

---

**Need help?** Create an issue in this repository or contact the development team. 