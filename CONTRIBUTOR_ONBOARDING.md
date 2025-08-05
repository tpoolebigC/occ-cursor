# 🚀 Contributor Onboarding Guide

**Welcome to the BigCommerce B2B Buyer Portal project!** This guide will get you up to speed quickly on where we are and how to contribute effectively.

## 📊 **Quick Status Overview**

### ✅ **What's Working (75% Complete)**
- **Custom Dashboard** (`/custom-dashboard`) - Complete B2B interface
- **Order Management** - View orders, order details, reorder functionality
- **Invoice Management** - View invoices and payment actions
- **Basic Quote Management** - Quote history (limited functionality)
- **Quick Order** - Product search and cart integration
- **Cart Synchronization** - Seamless integration with BigCommerce cart
- **B2B Authentication** - Proper two-token system

### 🚧 **What Needs Work (25% Remaining)**
- **Shopping Lists** - Create, manage, share lists
- **Address Management** - B2B address book
- **Advanced Quote Features** - Creation, approval workflows
- **User Management** - Roles and permissions

---

## 🏃‍♂️ **Quick Start (5 Minutes)**

### **1. Get the Code Running**
```bash
# Clone and setup
git clone <your-repo-url>
cd custom-portal-project
pnpm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your BigCommerce credentials

# Start development server
pnpm run dev

# Test the dashboard
open http://localhost:3000/custom-dashboard
```

### **2. Test Current Features**
- ✅ **Dashboard**: `http://localhost:3000/custom-dashboard`
- ✅ **Orders**: `http://localhost:3000/custom-dashboard/orders`
- ✅ **Invoices**: `http://localhost:3000/custom-dashboard/invoices`
- ✅ **Quotes**: `http://localhost:3000/custom-dashboard/quotes`
- ✅ **Quick Order**: `http://localhost:3000/custom-dashboard/quick-order`

### **3. Check Server Logs**
Look for these success patterns:
```javascript
// ✅ Working - Authentication
Session for customer info: { hasSession: true, hasUser: true, hasCustomerToken: true }

// ✅ Working - Order Data
[BigCommerce] query GetOrders - 254ms - complexity 2658

// ⚠️ Expected - Quote API (404 is normal for now)
B2B REST API error: { status: 404, statusText: 'Not Found' }
```

---

## 🎯 **What to Work On Next**

### **Priority 1: Shopping Lists (2-3 weeks)**

**Why This Matters**: Core B2B functionality that customers expect.

**What to Build**:
```typescript
// TODO: Implement in core/b2b/server-actions.ts
export async function getShoppingLists() {
  // Fetch shopping lists from B2B API
}

export async function createShoppingList(data: CreateShoppingListInput) {
  // Create new shopping list
}

export async function addToShoppingList(listId: string, items: ShoppingListItem[]) {
  // Add products to shopping list
}
```

**Files to Create**:
- `core/app/[locale]/(default)/custom-dashboard/shopping-lists/page.tsx`
- `core/b2b/components/ShoppingListTable.tsx`
- `core/b2b/components/ShoppingListForm.tsx`
- `core/b2b/components/AddToShoppingListButton.tsx`

**Reference**: See `docs/ROADMAP.md` for detailed implementation plan.

### **Priority 2: Address Management (1-2 weeks)**

**Why This Matters**: Required for order processing and customer experience.

**What to Build**:
```typescript
// TODO: Implement in core/b2b/server-actions.ts
export async function getAddresses() {
  // Fetch customer addresses
}

export async function createAddress(data: CreateAddressInput) {
  // Create new address
}

export async function setDefaultAddress(addressId: string, type: 'shipping' | 'billing') {
  // Set default address
}
```

**Files to Create**:
- `core/app/[locale]/(default)/custom-dashboard/addresses/page.tsx`
- `core/b2b/components/AddressBook.tsx`
- `core/b2b/components/AddressForm.tsx`

---

## 🏗️ **Architecture Overview**

### **Key Directories**
```
core/
├── app/[locale]/(default)/custom-dashboard/  # B2B Dashboard Routes
│   ├── page.tsx                              # Main dashboard
│   ├── orders/                               # Order management ✅
│   ├── invoices/                             # Invoice management ✅
│   ├── quotes/                               # Quote management ⚠️
│   ├── quick-order/                          # Quick order ✅
│   ├── shopping-lists/                       # TODO: Shopping lists
│   └── addresses/                            # TODO: Address management
├── b2b/                                      # B2B Components & Services
│   ├── components/                           # B2B UI components
│   ├── services/                             # Cart & API services
│   ├── server-actions.ts                     # Server-side data fetching
│   └── utils/                                # B2B utilities
└── components/                               # Shared components
```

### **Key Files to Know**
- **`core/b2b/server-actions.ts`** - All B2B data fetching (GraphQL + REST)
- **`core/b2b/services/cartService.ts`** - Cart integration with Catalyst
- **`core/b2b/components/CustomB2BDashboard.tsx`** - Main dashboard component
- **`core/b2b/components/B2BNavigation.tsx`** - Navigation component
- **`core/components/b2b/b2b-script.tsx`** - B2B script loading

---

## 🔧 **Development Guidelines**

### **1. Follow Catalyst Patterns**
```typescript
// ✅ DO: Use Catalyst utilities
import { addToOrCreateCart } from '~/lib/cart';
import { getCart as getCartData } from '~/client/queries/get-cart';

// ❌ DON'T: Create custom GraphQL mutations for cart
// const ADD_CART_LINE_ITEMS = graphql(`...`);
```

### **2. Use Proper GraphQL Patterns**
```typescript
// ✅ DO: Use correct BigCommerce patterns
const GET_ORDERS = graphql(`
  query GetOrders($first: Int = 50) {
    customer {
      orders(first: $first) {
        edges {
          node {
            entityId
            orderedAt { utc }
            status { value }
            // ... other fields
          }
        }
      }
    }
  }
`);

// ❌ DON'T: Use incorrect field names
// customer.orders.sku  // This doesn't exist
```

### **3. Handle Errors Gracefully**
```typescript
// ✅ DO: Comprehensive error handling
export async function getData() {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      return { data: null, error: 'No customer access token available' };
    }
    
    const result = await fetchData();
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

### **4. Test Thoroughly**
```bash
# Test your changes
pnpm typecheck          # TypeScript compilation
pnpm run build          # Build process
pnpm run dev            # Development server

# Test specific features
curl http://localhost:3000/custom-dashboard/test-page
```

---

## 🚨 **Common Issues & Quick Fixes**

### **Issue: 500 Errors on Dashboard**
**Quick Fix**: Check environment variables in `.env.local`
```bash
# Required variables
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
B2B_API_TOKEN=your_b2b_api_token_here
```

### **Issue: Cart Not Updating**
**Quick Fix**: Use Catalyst utilities, not custom GraphQL
```typescript
// ✅ Use this
import { addToOrCreateCart } from '~/lib/cart';

// ❌ Not this
// const ADD_CART_LINE_ITEMS = graphql(`...`);
```

### **Issue: GraphQL Schema Errors**
**Quick Fix**: Use correct field names from BigCommerce schema
```typescript
// ✅ Correct
customer.orders.edges.node.entityId

// ❌ Incorrect
customer.orders.sku  // This field doesn't exist
```

---

## 📚 **Essential Documentation**

### **Start Here**
1. **[Implementation Status](docs/IMPLEMENTATION_STATUS.md)** - Complete feature status
2. **[Development Roadmap](docs/ROADMAP.md)** - What's next and when
3. **[B2B Setup Guide](docs/B2B_SETUP.md)** - Production setup instructions

### **When You Need Help**
1. **[Troubleshooting Guide](docs/TROUBLESHOOTING_AND_FIXES.md)** - Common issues and solutions
2. **[B2B Auth Guide](docs/B2B_AUTH_GRAPHQL_GUIDE.md)** - API integration details

### **External Resources**
- **BigCommerce B2B Docs**: https://developer.bigcommerce.com/docs/b2b
- **Catalyst Docs**: https://catalyst.dev/docs/
- **BigCommerce Community**: https://developer.bigcommerce.com/community

---

## 🤝 **Contributing Process**

### **1. Create Feature Branch**
```bash
git checkout -b feature/shopping-lists
# or
git checkout -b feature/address-management
```

### **2. Follow Development Guidelines**
- Use Catalyst patterns
- Test thoroughly
- Handle errors gracefully
- Update documentation

### **3. Test Your Changes**
```bash
# Test locally
pnpm run dev
# Test all features work
# Test error scenarios

# Check TypeScript
pnpm typecheck

# Build test
pnpm run build
```

### **4. Update Documentation**
- Update relevant docs if you change APIs
- Add examples for new features
- Update implementation status

### **5. Create Pull Request**
- Clear description of changes
- Link to relevant documentation
- Include testing notes

---

## 🎯 **Success Metrics**

### **What We're Measuring**
- **API Response Time**: < 500ms average
- **Error Rate**: < 1% error rate
- **TypeScript Coverage**: 100% type safety
- **User Experience**: Fast, reliable, intuitive

### **Current Status**
- ✅ **API Response Time**: Working (< 500ms)
- ✅ **Error Rate**: Working (< 1%)
- ✅ **TypeScript Coverage**: Working (100%)
- ⚠️ **Test Coverage**: Needs improvement

---

## 📞 **Getting Help**

### **When You're Stuck**
1. **Check the troubleshooting guide** - Most issues are documented
2. **Look at server logs** - They provide detailed error information
3. **Test with curl** - Verify API endpoints directly
4. **Ask in team chat** - We're here to help!

### **Information to Provide**
When asking for help, include:
- **Error messages** from console
- **Steps to reproduce** the issue
- **What you expected** vs what happened
- **Environment details** (browser, OS, etc.)

---

**Welcome to the team! 🚀**

This is a production-ready B2B implementation that's already serving real customers. Your contributions will directly impact business operations, so we appreciate your attention to quality and testing.

**Happy coding!** 🎉 