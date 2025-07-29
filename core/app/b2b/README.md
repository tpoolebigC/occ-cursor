# Clean B2B Architecture Implementation

This directory demonstrates the **proper way** to implement B2B functionality in Catalyst using **server actions** and the **Catalyst client**.

## 🎯 **The Right Approach**

Instead of using custom GraphQL clients or server components for everything, we use:

1. **Server Actions** (`'use server'`) - Handle API calls and business logic
2. **Catalyst Client** - Leverage the official BigCommerce client
3. **Client Components** - Consume server actions and handle UI state

## 📁 **File Structure**

```
/app/b2b/
├── layout.tsx              # B2B layout with navigation
├── page.tsx                # Dashboard (client component)
├── quotes/
│   └── page.tsx           # Quotes page (client component)
└── README.md              # This file

/lib/b2b/
└── server-actions.ts      # Server actions using Catalyst client
```

## 🔧 **Key Implementation Details**

### **Server Actions** (`/lib/b2b/server-actions.ts`)

```typescript
'use server';

import { createClient } from '@bigcommerce/catalyst-client';

// Create Catalyst client for B2B operations
const catalystClient = createClient({
  storeHash: process.env.BIGCOMMERCE_STORE_HASH!,
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN!,
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID!,
  platform: 'catalyst-b2b',
});

// Server action for getting quotes
export async function getBuyerQuotes(buyerId: string) {
  const customerAccessToken = await getSessionCustomerAccessToken();
  
  const response = await catalystClient.fetch({
    document: GET_QUOTES_QUERY,
    variables: { buyerId },
    customerAccessToken,
  });
  
  return response.data.quotes;
}
```

### **Client Components** (`/app/b2b/quotes/page.tsx`)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getBuyerQuotes } from '~/lib/b2b/server-actions';

function QuotesList({ buyerId }: { buyerId: string }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const quotesData = await getBuyerQuotes(buyerId);
      setQuotes(quotesData.quotes);
      setLoading(false);
    }
    loadData();
  }, [buyerId]);

  // Render UI...
}
```

## ✅ **Benefits of This Approach**

1. **Leverages Catalyst Client** - Uses the official, maintained BigCommerce client
2. **Server Actions** - Proper Next.js pattern for API calls
3. **Type Safety** - Full TypeScript support
4. **Error Handling** - Built-in error handling from Catalyst client
5. **Performance** - Server-side API calls with client-side state management
6. **Maintainability** - Clean separation of concerns

## 🚀 **How to Use**

1. **Navigate to `/b2b`** - See the dashboard
2. **Navigate to `/b2b/quotes`** - See quotes management
3. **Compare with other approaches**:
   - `/custom-buyer-portal` - UI-focused demo
   - `http://localhost:3000/#/orders` - Embedded buyer portal

## 🔄 **Data Flow**

```
Client Component → Server Action → Catalyst Client → BigCommerce API
                ← Response Data ← Response Data ← Response Data
```

## 🛠 **Environment Variables**

Make sure you have these environment variables set:

```env
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_STOREFRONT_TOKEN=your_storefront_token
BIGCOMMERCE_CHANNEL_ID=your_channel_id
B2B_API_TOKEN=your_b2b_api_token (optional)
```

## 📝 **Next Steps**

1. **Implement `getCustomerEmailFromToken`** - Map BigCommerce customers to B2B buyers
2. **Add more server actions** - Orders, customers, requisition lists
3. **Add mutations** - Create, update, delete operations
4. **Add real-time updates** - WebSocket or polling for live data

## 🎨 **UI Components**

The implementation includes:
- Responsive navigation sidebar
- Loading states with skeleton UI
- Error handling with user-friendly messages
- Modern, clean design using Tailwind CSS
- Lucide React icons for consistency

## 🔒 **Authentication**

- Uses existing Catalyst authentication
- Maps BigCommerce customers to B2B buyers
- Handles authentication errors gracefully
- Redirects to login when needed

This implementation follows **Next.js best practices** and leverages the **official Catalyst client** for maximum reliability and maintainability. 