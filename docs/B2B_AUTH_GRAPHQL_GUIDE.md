# B2B Authentication & GraphQL Workflow Guide

## Overview

This guide explains the B2B authentication flow and how to properly fetch B2B data (orders, quotes, invoices) using the BigCommerce B2B GraphQL API.

## 🔐 B2B Authentication Flow

### 1. **Two-Token System**

BigCommerce B2B uses a two-token authentication system:

#### **B2B API Token (Static)**
- **Purpose**: Server-to-server (S2S) calls to B2B REST APIs
- **Location**: B2B Edition Admin Portal
- **Usage**: Retrieve companies, quotes, requisitions, sales rep data
- **Header**: `Authorization: Bearer <B2B_API_TOKEN>`

#### **Buyer JWT Token (Dynamic)**
- **Purpose**: Customer-scoped access to B2B GraphQL API
- **Generation**: Created after buyer login via `loginWithB2B` function
- **Usage**: Fetch customer-specific orders, quotes, invoices
- **Header**: `Authorization: Bearer <BUYER_JWT>`

### 2. **Authentication Process**

```typescript
// 1. Customer logs in with email/password
const loginResult = await client.fetch({
  document: LoginMutation,
  variables: { email, password, cartEntityId: cartId },
});

// 2. Get B2B token for the customer
const b2bToken = await loginWithB2B({
  customerId: loginResult.customer.entityId,
  customerAccessToken: loginResult.customerAccessToken,
});

// 3. Store B2B token in session
session.b2bToken = b2bToken;
```

## 🧵 B2B GraphQL API Usage

### **Base URL**
```
https://api.bigcommerce.com/graphql
```

### **Authentication Header**
```http
Authorization: Bearer <B2B_JWT_TOKEN>
```

### **Key Differences from Regular BigCommerce GraphQL**

| Feature | Regular BigCommerce | B2B BigCommerce |
|---------|-------------------|-----------------|
| Orders | `customer.orders` | `customer.orders` (same) |
| Quotes | Not available | Not available (requires B2B REST APIs) |
| Invoices | Not available | Not available (requires B2B REST APIs) |
| Authentication | Customer Access Token | B2B JWT Token |
| API Host | `api.bigcommerce.com` | `api.bigcommerce.com` (same) |

**Note**: B2B-specific features like quotes and company orders require REST API calls to the B2B API endpoints, not GraphQL.

## 📊 Example Queries

### **Customer Information**
```graphql
query GetB2BCustomerInfo {
  customer {
    entityId
    email
    firstName
    lastName
    company
    addresses {
      edges {
        node {
          entityId
          firstName
          lastName
          company
          address1
          address2
          city
          stateOrProvince
          countryCode
          postalCode
        }
      }
    }
  }
}
```

### **Company Orders**
```graphql
query GetB2BOrders($first: Int, $after: String) {
  customer {
    companyOrders(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          referenceNumber
          orderedAt {
            utc
          }
          status {
            value
          }
          totalIncTax {
            value
          }
          billingAddress {
            firstName
            lastName
            company
            address1
            address2
            city
            stateOrProvince
            countryCode
            postalCode
          }
        }
      }
    }
  }
}
```

### **Quotes**
```graphql
query GetB2BQuotes {
  customer {
    quotes {
      edges {
        node {
          entityId
          name
          status
          createdAt {
            utc
          }
          totalIncTax {
            value
          }
        }
      }
    }
  }
}
```

## 🛠 Implementation in Catalyst

### **Server Actions (`server-actions.ts`)**

```typescript
// B2B GraphQL client function
async function b2bGraphQLClient(query: string, variables?: any) {
  const session = await auth();
  
  if (!session?.b2bToken) {
    throw new Error('No B2B token available');
  }

  const B2B_API_HOST = process.env.B2B_API_HOST || 'https://api-b2b.bigcommerce.com';
  const url = `${B2B_API_HOST}/graphql`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.b2bToken}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`B2B GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`B2B GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
  }

  return result.data;
}
```

### **Client Hooks (`client-hooks.ts`)**

```typescript
// Custom hook for B2B server actions
function useB2BServerAction<T>(
  action: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await action();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
}
```

## 🚨 Common Issues & Solutions

### **1. "No B2B token available"**
**Cause**: Customer not properly authenticated with B2B API
**Solution**: 
- Ensure `loginWithB2B` is called after successful customer login
- Check that B2B API token is configured in environment variables
- Verify customer is associated with a B2B company

### **2. "B2B GraphQL request failed: 401"**
**Cause**: Invalid or expired B2B JWT token
**Solution**:
- Re-authenticate the customer
- Check token expiration
- Ensure proper Authorization header format

### **3. "No orders/quotes found"**
**Cause**: Customer not associated with B2B company or no B2B orders
**Solution**:
- Verify customer is part of a B2B company in admin
- Check that orders were placed as company orders (not regular storefront)
- Ensure using correct customer email/password for B2B account

### **4. GraphQL Schema Errors**
**Cause**: Using regular BigCommerce queries instead of B2B-specific ones
**Solution**:
- Use `companyOrders` instead of `orders`
- Use `customer.quotes` for quotes
- Ensure all field names match B2B schema

## 🔧 Environment Variables

```bash
# Required for B2B authentication
B2B_API_TOKEN=your_b2b_api_token_here
BIGCOMMERCE_CHANNEL_ID=your_channel_id_here

# Optional - defaults to production
B2B_API_HOST=https://api-b2b.bigcommerce.com

# For staging/testing
STAGING_B2B_CDN_ORIGIN=https://staging-cdn.bundleb2b.net
```

## 📝 Debugging Tips

### **1. Check Session Data**
```typescript
const session = await auth();
console.log('Session debug:', {
  hasSession: !!session,
  hasUser: !!session?.user,
  hasB2bToken: !!session?.b2bToken,
  b2bTokenLength: session?.b2bToken?.length || 0,
  userEmail: session?.user?.email,
});
```

### **2. Test B2B GraphQL Directly**
```bash
curl -X POST https://api-b2b.bigcommerce.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_B2B_JWT_TOKEN" \
  -d '{
    "query": "query { customer { entityId email firstName lastName } }"
  }'
```

### **3. Monitor Network Requests**
- Check browser Network tab for GraphQL requests
- Verify Authorization headers are present
- Look for 401/403 errors indicating auth issues

## 🎯 Best Practices

1. **Always use B2B-specific queries** for B2B data
2. **Handle token expiration** gracefully
3. **Cache B2B tokens** appropriately
4. **Use proper error handling** for network failures
5. **Test with real B2B accounts** that have orders/quotes
6. **Monitor API rate limits** and implement backoff strategies

## 🔗 Related Files

- `core/auth/index.ts` - Authentication configuration
- `core/features/b2b/services/client.ts` - B2B API client
- `core/b2b/server-actions.ts` - B2B GraphQL queries
- `core/b2b/client-hooks.ts` - React hooks for B2B data
- `core/b2b/components/CustomB2BDashboard.tsx` - Dashboard component

## 📚 Additional Resources

- [BigCommerce B2B API Documentation](https://developer.bigcommerce.com/api-docs/b2b)
- [B2B GraphQL Schema](https://api-b2b.bigcommerce.com/graphql)
- [B2B Edition Admin Portal](https://admin.bigcommerce.com/b2b) 