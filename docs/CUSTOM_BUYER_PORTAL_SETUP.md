# Custom Buyer Portal Setup Guide

This guide walks you through setting up a custom Buyer Portal for your Catalyst storefront, including local development and production deployment.

## ✅ Current Status: Local Development Complete

**Local testing confirmed successful!** 
- ✅ Catalyst (`localhost:3000`) loads local Buyer Portal (red indicator visible)
- ✅ Buyer Portal dev server (`localhost:3001`) running correctly
- ✅ Production build generated successfully

## 📋 Prerequisites

- Node.js 18+ and pnpm installed
- BigCommerce B2B Edition store with API access
- WebDAV access to your BigCommerce store
- Git access to clone repositories

## 🚀 Step-by-Step Implementation

### Step 1: Fork and Setup Buyer Portal

```bash
# Clone the Buyer Portal repository
git clone https://github.com/bigcommerce/b2b-buyer-portal.git
cd b2b-buyer-portal

# Install dependencies
yarn install

# Copy environment configuration
cp apps/storefront/.env-example apps/storefront/.env
```

**Configure `apps/storefront/.env`:**
```env
# API URL for local development
VITE_B2B_URL=https://api-b2b.bigcommerce.com

# App Client ID (keep default)
VITE_LOCAL_APP_CLIENT_ID=dl7c39mdpul6hyc489yk0vzxl6jesyx

# Enable local environment
VITE_IS_LOCAL_ENVIRONMENT=TRUE

# Store configuration for local development
VITE_STORE_HASH=your_store_hash_here
VITE_CHANNEL_ID=your_channel_id_here

# Leave empty for local development
VITE_ASSETS_ABSOLUTE_PATH=''
```

### Step 2: Configure Catalyst for Local Development

**Add to your Catalyst `.env.local`:**
```env
# Point Catalyst to local Buyer Portal
LOCAL_BUYER_PORTAL_HOST=http://localhost:3001
```

### Step 3: Start Local Development

**Terminal 1 - Buyer Portal:**
```bash
cd b2b-buyer-portal
yarn dev
```

**Terminal 2 - Catalyst:**
```bash
cd custom-portal-project
pnpm dev
```

**Test the integration:**
1. Go to `http://localhost:3000`
2. Login as B2B user
3. Navigate to Buyer Portal
4. You should see a red "LOCAL BUYER PORTAL" indicator (confirms local version is loading)

### Step 4: Production Build Configuration

**Create production environment file:**
```bash
cp apps/storefront/.env apps/storefront/.env.production
```

**Configure `apps/storefront/.env.production`:**
```env
# Production configuration
VITE_B2B_URL=https://api-b2b.bigcommerce.com
VITE_LOCAL_APP_CLIENT_ID=dl7c39mdpul6hyc489yk0vzxl6jesyx
VITE_IS_LOCAL_ENVIRONMENT=FALSE
VITE_STORE_HASH=your_store_hash_here
VITE_CHANNEL_ID=your_channel_id_here

# Production assets path (versioned for cache busting)
VITE_ASSETS_ABSOLUTE_PATH=https://store-{store_hash}.mybigcommerce.com/content/b2b-2025-01-15/

# Disable build hashes for versioning strategy
VITE_DISABLE_BUILD_HASH=TRUE
```

**Build production assets:**
```bash
# Clear cache
rm -rf .turbo/cache

# Switch to production config
cp apps/storefront/.env.production apps/storefront/.env

# Build
yarn build
```

**Generated files in `apps/storefront/dist/`:**
- `index.js` - Main Buyer Portal script
- `assets/` - All CSS, JS, and image assets
- `polyfills-legacy.js` - Legacy browser support

### Step 5: WebDAV Deployment

**Upload to BigCommerce WebDAV:**
1. Access your store's WebDAV: `https://store-{store_hash}.mybigcommerce.com/content/`
2. Create directory: `b2b-2025-01-15/`
3. Upload all contents of `apps/storefront/dist/` to this directory

**Expected URLs after upload:**
```
https://store-{store_hash}.mybigcommerce.com/content/b2b-2025-01-15/index.js
https://store-{store_hash}.mybigcommerce.com/content/b2b-2025-01-15/assets/
https://store-{store_hash}.mybigcommerce.com/content/b2b-2025-01-15/polyfills-legacy.js
```

### Step 6: Configure Catalyst for Production

**Update your Catalyst environment variables:**
```env
# Remove local development setting
# LOCAL_BUYER_PORTAL_HOST=http://localhost:3001

# Add production version
BUYER_PORTAL_ASSETS_VERSION=2025-01-15
```

**Deploy your Catalyst project** - the custom loader will automatically use the versioned assets.

## 🔄 Versioning Strategy

### Benefits
- **Cache Busting**: Each version gets a new URL, ensuring fresh assets
- **Easy Rollbacks**: Simply change `BUYER_PORTAL_ASSETS_VERSION` to point to previous version
- **No Script Updates**: No need to modify `script-production.tsx` for new deployments

### Naming Convention
- Use date format: `b2b-YYYY-MM-DD`
- Example: `b2b-2025-01-15`, `b2b-2025-01-20`

### Update Process
1. **Build new version:**
   ```bash
   # Update VITE_ASSETS_ABSOLUTE_PATH in .env.production
   VITE_ASSETS_ABSOLUTE_PATH=https://store-{store_hash}.mybigcommerce.com/content/b2b-2025-01-20/
   
   # Build
   yarn build
   ```

2. **Upload to new directory:**
   - Create `b2b-2025-01-20/` in WebDAV
   - Upload new dist contents

3. **Update Catalyst:**
   ```env
   BUYER_PORTAL_ASSETS_VERSION=2025-01-20
   ```

4. **Deploy Catalyst** - automatically switches to new version

## 🔧 Environment Variables Reference

### Buyer Portal (apps/storefront/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_B2B_URL` | B2B API endpoint | `https://api-b2b.bigcommerce.com` |
| `VITE_LOCAL_APP_CLIENT_ID` | App client ID | `dl7c39mdpul6hyc489yk0vzxl6jesyx` |
| `VITE_IS_LOCAL_ENVIRONMENT` | Local dev flag | `TRUE` (dev) / `FALSE` (prod) |
| `VITE_STORE_HASH` | Your store hash | `7qgtlochx0` |
| `VITE_CHANNEL_ID` | Your channel ID | `1755801` |
| `VITE_ASSETS_ABSOLUTE_PATH` | Production assets URL | `https://store-{hash}.mybigcommerce.com/content/b2b-2025-01-15/` |
| `VITE_DISABLE_BUILD_HASH` | Disable file hashing | `TRUE` |

### Catalyst (.env.local)
| Variable | Description | Example |
|----------|-------------|---------|
| `LOCAL_BUYER_PORTAL_HOST` | Local dev server | `http://localhost:3001` |
| `BUYER_PORTAL_ASSETS_VERSION` | Production version | `2025-01-15` |

## 🐛 Troubleshooting

### Local Development Issues
- **Buyer Portal not loading**: Check `LOCAL_BUYER_PORTAL_HOST` in Catalyst `.env.local`
- **Styling issues**: Verify `VITE_STORE_HASH` and `VITE_CHANNEL_ID` in Buyer Portal `.env`
- **Build errors**: Clear `.turbo/cache` before rebuilding

### Production Issues
- **404 errors**: Verify WebDAV upload completed successfully
- **CORS errors**: Check `VITE_ASSETS_ABSOLUTE_PATH` configuration
- **Cache issues**: Verify `BUYER_PORTAL_ASSETS_VERSION` matches uploaded directory

### Common Commands
```bash
# Clear build cache
rm -rf .turbo/cache

# Switch between dev/prod configs
cp apps/storefront/.env.backup apps/storefront/.env  # dev
cp apps/storefront/.env.production apps/storefront/.env  # prod

# Check build output
ls -la apps/storefront/dist/
```

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` files to version control
- **API Tokens**: Use environment-specific B2B API tokens
- **WebDAV Access**: Limit WebDAV access to necessary directories only
- **Version Control**: Keep Buyer Portal source code in private repository

## 📚 Additional Resources

- [Buyer Portal Repository](https://github.com/bigcommerce/b2b-buyer-portal)
- [Buyer Portal Headless Guide](https://developer.bigcommerce.com/docs/ZG9jOjIyNDE5Mw-b2b-buyer-portal-headless)
- [Catalyst B2B Guide](https://developer.bigcommerce.com/docs/ZG9jOjIyNDE5Mw-catalyst-b2b)
- [BigCommerce WebDAV Documentation](https://developer.bigcommerce.com/docs/ZG9jOjIyNDE5Mw-webdav)

## 🆘 Support

For issues specific to this custom setup:
1. Check the troubleshooting section above
2. Verify all environment variables are correctly set
3. Test with the local development setup first
4. Review BigCommerce developer documentation

---

**Last Updated**: January 15, 2025  
**Version**: 1.0  
**Status**: Local Development Complete ✅ 