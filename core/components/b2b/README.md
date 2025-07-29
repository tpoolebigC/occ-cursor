# B2B Buyer Portal Integration

This project uses BigCommerce's **embedded buyer portal** with enhanced Algolia search integration and Makeswift page building capabilities.

## 🎯 **What This Provides**

- **Embedded Buyer Portal**: BigCommerce's official B2B portal loaded via CDN
- **Algolia Search**: Enhanced product search with faceted filtering
- **Makeswift Integration**: Visual page building for custom storefronts
- **Session Management**: Seamless authentication flow

## 🚀 **Quick Start**

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# BigCommerce Store
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_STOREFRONT_TOKEN=your_storefront_token

# B2B API (for embedded portal)
B2B_CLIENT_ID=your_b2b_client_id
B2B_CLIENT_SECRET=your_b2b_client_secret
B2B_API_TOKEN=your_b2b_api_token

# Algolia Search
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_SEARCH_KEY=your_algolia_search_key
ALGOLIA_ADMIN_KEY=your_algolia_admin_key
ALGOLIA_INDEX_NAME=your_index_name
```

### 2. B2B Authentication Flow

The embedded portal handles authentication automatically:

1. **Customer Login**: Uses NextAuth.js with BigCommerce
2. **B2B Token Generation**: Automatically generates B2B tokens for authenticated users
3. **Portal Loading**: Loads the official BigCommerce B2B portal

### 3. Access the Portal

- **B2B Users**: Automatically redirected to `/?section=orders` when accessing account pages
- **Regular Users**: Standard customer account experience

## 🔧 **Components**

### B2B Loader (`b2b-loader.tsx`)
- Loads the B2B script from BigCommerce CDN
- Handles session management
- Passes authentication tokens to the portal

### B2B Script (`b2b-script.tsx`)
- Renders the B2B script tags
- Manages B2B SDK integration
- Handles portal configuration

### B2B Auth Hook (`use-b2b-auth.ts`)
- Manages B2B authentication state
- Handles login/logout events
- Integrates with the B2B SDK

## 🔍 **Algolia Integration**

### Product Search
- Faceted search with categories, brands, price ranges
- Real-time search suggestions
- Advanced filtering options

### Search Components
- `SearchForm`: Main search interface
- `SearchResults`: Displays search results
- `SearchFilters`: Faceted filtering

## 🎨 **Makeswift Integration**

### Available Components
- Product cards and carousels
- Search forms and results
- Navigation and layout components
- Custom content sections

### Page Building
- Visual drag-and-drop interface
- Responsive design tools
- Component customization
- Live preview

## 📁 **File Structure**

```
core/
├── components/
│   ├── b2b/
│   │   ├── b2b-loader.tsx      # B2B portal loader
│   │   ├── b2b-script.tsx      # B2B script renderer
│   │   ├── use-b2b-auth.ts     # B2B auth hook
│   │   └── README.md           # This file
│   └── search-form/
│       └── index.tsx           # Algolia search form
├── features/
│   ├── algolia/                # Algolia search features
│   └── makeswift/              # Makeswift components
├── lib/
│   ├── b2b/
│   │   └── config.ts           # B2B configuration
│   └── algolia/                # Algolia utilities
└── app/
    ├── buyer-portal/           # Embedded portal route
    └── search/                 # Search results page
```

## 🔒 **Security**

- **Session-based authentication**: Uses existing customer sessions
- **Token management**: Automatic B2B token generation
- **Secure API calls**: All API calls go through server-side routes
- **Environment variables**: Sensitive data stored in environment variables

## 🚀 **Deployment**

1. **Environment Setup**: Configure all required environment variables
2. **Build**: Run `pnpm build` to build the application
3. **Deploy**: Deploy to your hosting platform (Vercel, Netlify, etc.)
4. **Verify**: Test B2B portal access and Algolia search functionality

## 🐛 **Troubleshooting**

### B2B Portal Not Loading
- Check B2B API credentials in environment variables
- Verify customer authentication is working
- Check browser console for script loading errors

### Algolia Search Issues
- Verify Algolia credentials and index configuration
- Check search component implementation
- Review Algolia dashboard for indexing status

### Makeswift Components Missing
- Ensure all components are properly registered
- Check component imports in Makeswift runtime
- Verify component props and configuration

## 📚 **Resources**

- [BigCommerce B2B Documentation](https://developer.bigcommerce.com/docs/ZG9jOjIyNDE3Mw-b2b)
- [Algolia Documentation](https://www.algolia.com/doc/)
- [Makeswift Documentation](https://www.makeswift.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## 🤝 **Support**

For issues specific to this implementation:
1. Check the troubleshooting section above
2. Review environment variable configuration
3. Check browser console for errors
4. Verify BigCommerce store settings

For BigCommerce B2B issues:
- [BigCommerce Support](https://support.bigcommerce.com/)
- [BigCommerce Developer Community](https://community.bigcommerce.com/) 