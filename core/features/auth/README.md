# Authentication Workflow & Vercel Compatibility

## Overview

This document outlines the authentication workflow and ensures compatibility with Vercel deployment.

## Authentication Flow

### 1. **Anonymous Session Management**
- Anonymous sessions are created automatically for all users
- Sessions are managed via NextAuth.js with JWT strategy
- Anonymous sessions allow cart persistence without login

### 2. **Customer Authentication**
- Supports both password and JWT-based authentication
- Integrates with BigCommerce Customer Login API
- Handles cart merging when users log in

### 3. **B2B Authentication**
- Separate B2B token management
- Integrates with BigCommerce B2B API
- Supports role-based access control

## Vercel Compatibility Analysis

### ✅ **Compatible Features**

#### **NextAuth.js Configuration**
```typescript
const config = {
  // Vercel-compatible cookie settings
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production', // ✅ Vercel sets NODE_ENV=production
        httpOnly: true,
        path: '/',
      },
    },
    // Partitioned cookies for Makeswift compatibility
    callbackUrl: partitionedCookie(),
    csrfToken: partitionedCookie(),
    // ... other cookies
  },
  session: {
    strategy: 'jwt', // ✅ JWT strategy works on Vercel
  },
  // Trust host configuration for Vercel
  trustHost: process.env.AUTH_TRUST_HOST === 'true' ? true : undefined,
};
```

#### **Environment Variables**
All required environment variables are properly configured for Vercel:

```bash
# BigCommerce Configuration
BIGCOMMERCE_STORE_HASH=your_store_hash_here
BIGCOMMERCE_CHANNEL_ID=your_channel_id_here
BIGCOMMERCE_CLIENT_ID=your_client_id_here
BIGCOMMERCE_CLIENT_SECRET=your_client_secret_here
BIGCOMMERCE_ACCESS_TOKEN=your_access_token_here

# B2B Configuration
B2B_API_TOKEN=your_b2b_api_token_here
B2B_API_HOST=https://api-b2b.bigcommerce.com/

# Auth Configuration
AUTH_TRUST_HOST=true  # ✅ Required for Vercel
AUTH_SECRET=your_auth_secret_here  # ✅ Required for JWT signing
```

#### **Middleware Configuration**
```typescript
export const config = {
  matcher: [
    // ✅ Properly excludes Vercel-specific paths
    '/((?!api|admin|_next/static|_next/image|_vercel|favicon.ico|xmlsitemap.php|sitemap.xml|robots.txt|login/token|buyer-portal).*)',
  ],
};
```

### ⚠️ **Potential Issues & Solutions**

#### **1. Cookie Domain Issues**
**Issue**: Cookies might not work properly on Vercel's edge functions
**Solution**: Use `sameSite: 'lax'` and ensure proper domain configuration

#### **2. JWT Token Size**
**Issue**: Large JWT tokens might exceed Vercel's limits
**Solution**: Keep tokens minimal and use server-side storage for large data

#### **3. Edge Function Limitations**
**Issue**: Some Node.js APIs might not be available in edge functions
**Solution**: Use Vercel's serverless functions for complex operations

## Required Vercel Environment Variables

### **Essential Variables**
```bash
# Auth Configuration
AUTH_SECRET=your_secure_random_string_here
AUTH_TRUST_HOST=true

# BigCommerce Configuration
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_CLIENT_ID=your_client_id
BIGCOMMERCE_CLIENT_SECRET=your_client_secret
BIGCOMMERCE_ACCESS_TOKEN=your_access_token

# B2B Configuration (if using B2B features)
B2B_API_TOKEN=your_b2b_api_token
B2B_API_HOST=https://api-b2b.bigcommerce.com/
```

### **Optional Variables**
```bash
# Algolia Configuration (if using search)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_APP_KEY=your_algolia_search_api_key
NEXT_PUBLIC_ALGOLIA_INDEXNAME=your_algolia_index_name

# Makeswift Configuration (if using visual editing)
MAKESWIFT_SITE_API_KEY=your_makeswift_site_api_key
MAKESWIFT_API_ORIGIN=https://api.makeswift.com
```

## Deployment Checklist

### **Pre-Deployment**
- [ ] Set all required environment variables in Vercel
- [ ] Ensure `AUTH_SECRET` is a secure random string
- [ ] Set `AUTH_TRUST_HOST=true` for Vercel
- [ ] Configure BigCommerce webhooks (if needed)
- [ ] Test authentication flow locally

### **Post-Deployment**
- [ ] Verify anonymous session creation
- [ ] Test customer login/logout
- [ ] Test B2B authentication (if applicable)
- [ ] Verify cart persistence
- [ ] Test protected routes
- [ ] Check cookie behavior in production

## Troubleshooting

### **Common Issues**

#### **1. Authentication Not Working**
```bash
# Check environment variables
echo $AUTH_SECRET
echo $AUTH_TRUST_HOST
echo $BIGCOMMERCE_STORE_HASH
```

#### **2. Cookies Not Persisting**
- Ensure `secure: true` in production
- Check `sameSite` configuration
- Verify domain settings

#### **3. B2B Authentication Failing**
- Verify B2B API credentials
- Check network connectivity to B2B API
- Review B2B API logs

### **Debug Commands**
```bash
# Check Vercel function logs
vercel logs

# Test authentication endpoints
curl -X POST https://your-app.vercel.app/api/auth/signin

# Verify environment variables
vercel env ls
```

## Security Considerations

### **Production Security**
- Use HTTPS in production (Vercel handles this)
- Set secure cookie flags
- Implement proper CSRF protection
- Use environment variables for secrets
- Regular security audits

### **B2B Security**
- Secure B2B API token storage
- Implement role-based access control
- Audit B2B API access logs
- Regular token rotation

## Performance Optimization

### **Vercel Optimizations**
- Use edge functions for simple operations
- Implement proper caching strategies
- Optimize JWT token size
- Use Vercel's CDN for static assets

### **Authentication Optimizations**
- Cache user sessions appropriately
- Minimize API calls to BigCommerce
- Use efficient token storage
- Implement proper error handling

## Monitoring & Analytics

### **Recommended Monitoring**
- Authentication success/failure rates
- Session duration metrics
- B2B API response times
- Error rate monitoring
- User activity tracking

### **Vercel Analytics**
- Function execution times
- Edge function performance
- Cache hit rates
- Error tracking 