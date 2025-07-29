# Custom Buyer Portal - B2B Demo

This directory contains a comprehensive custom B2B buyer portal implementation built with Catalyst and BigCommerce APIs. This serves as a showcase for clients looking to implement headless B2B solutions.

## 🎯 Overview

The custom buyer portal demonstrates how to build a complete B2B management system using:
- **Next.js 14** with App Router
- **BigCommerce APIs** for data
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Makeswift components** for reusability

## 🚀 Features

### ✅ Implemented Features

1. **Dashboard Overview**
   - Customer management interface
   - Order tracking and history
   - Quote management system
   - Real-time statistics and metrics
   - Quick action buttons

2. **Customer Management**
   - Customer search and filtering
   - Customer profile cards
   - Company information display
   - Order and revenue tracking per customer

3. **Analytics Dashboard**
   - Revenue trends and metrics
   - Order volume tracking
   - Customer performance analysis
   - Geographic distribution
   - Product performance insights

4. **Navigation System**
   - Collapsible sidebar navigation
   - Breadcrumb navigation
   - Responsive design
   - Active state indicators

### 🔄 Available Pages

- `/custom-buyer-portal` - Main dashboard
- `/custom-buyer-portal/customers` - Customer management
- `/custom-buyer-portal/analytics` - Analytics dashboard
- `/custom-buyer-portal/orders` - Order management (placeholder)
- `/custom-buyer-portal/quotes` - Quote management (placeholder)
- `/custom-buyer-portal/catalog` - Product catalog (placeholder)
- `/custom-buyer-portal/shipping` - Shipping management (placeholder)
- `/custom-buyer-portal/billing` - Billing management (placeholder)
- `/custom-buyer-portal/reports` - Reports (placeholder)
- `/custom-buyer-portal/settings` - Settings (placeholder)

## 🏗️ Architecture

### File Structure

```
custom-buyer-portal/
├── layout.tsx              # Main layout with sidebar
├── page.tsx                # Dashboard homepage
├── customers/
│   └── page.tsx           # Customer management page
├── analytics/
│   └── page.tsx           # Analytics dashboard
└── README.md              # This file
```

### Key Components

1. **Layout System**
   - `layout.tsx` - Provides sidebar navigation and header
   - Responsive design with collapsible sidebar
   - Consistent branding and navigation

2. **Dashboard Components**
   - Customer selector with search
   - Order history with real-time data
   - Quote management interface
   - Statistics cards with metrics

3. **Data Integration**
   - Uses existing B2B API endpoints
   - Integrates with Makeswift components
   - Real customer data from BigCommerce

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Purple**: Purple (#8B5CF6)
- **Orange**: Orange (#F97316)

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Monospace**: For code and data

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Consistent styling with hover states
- **Forms**: Clean, accessible form elements
- **Tables**: Responsive data tables

## 🔧 Technical Implementation

### Data Sources

The portal uses several API endpoints:

```typescript
// Customer data
GET /api/b2b/customers

// Order data
GET /api/b2b/orders

// Quote data
GET /api/b2b/quotes

// Analytics data
GET /api/b2b/stats
```

### Component Integration

```typescript
// Customer selector
import { CustomerSelector } from '~/features/makeswift/components/customer-selector';

// Order history
import { OrderHistory } from '~/features/makeswift/components/order-history';

// Quote list
import { QuoteList } from '~/features/makeswift/components/quote-list';
```

### State Management

- Uses React hooks for local state
- Server-side data fetching with Next.js
- Client-side state for UI interactions

## 🚀 Getting Started

### Prerequisites

1. **BigCommerce Store** with B2B features enabled
2. **B2B API credentials** configured
3. **Environment variables** set up

### Environment Variables

```bash
# BigCommerce Configuration
BIGCOMMERCE_STORE_HASH=your_store_hash
BIGCOMMERCE_CHANNEL_ID=your_channel_id
BIGCOMMERCE_CLIENT_ID=your_client_id
BIGCOMMERCE_CLIENT_SECRET=your_client_secret

# B2B Configuration
B2B_API_TOKEN=your_b2b_api_token
B2B_API_HOST=https://api-b2b.bigcommerce.com/
```

### Running the Portal

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the portal**:
   ```
   http://localhost:3000/custom-buyer-portal
   ```

3. **Explore different sections**:
   - Dashboard: `/custom-buyer-portal`
   - Customers: `/custom-buyer-portal/customers`
   - Analytics: `/custom-buyer-portal/analytics`

## 📊 Demo Data

The portal currently uses mock data for demonstration purposes. In production, this would be replaced with real BigCommerce API calls.

### Sample Data Structure

```typescript
// Customer data
{
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@acme.com',
  company: 'Acme Corporation',
  customerGroup: { id: '1', name: 'Wholesale' }
}

// Order data
{
  id: '1',
  orderNumber: 'ORD-2024-001',
  status: 'delivered',
  customer: { id: '1', firstName: 'John', lastName: 'Doe' },
  totalAmount: { amount: 1250.00, currencyCode: 'USD' },
  createdAt: '2024-01-15T10:30:00Z'
}
```

## 🎯 Client Demonstration Guide

### Key Talking Points

1. **Custom vs Embedded Portal**
   - Compare with `/buyer-portal` (embedded solution)
   - Highlight customization capabilities
   - Show integration flexibility

2. **Feature Showcase**
   - Customer management interface
   - Real-time analytics
   - Order tracking system
   - Quote management

3. **Technical Benefits**
   - Full control over UI/UX
   - Custom branding opportunities
   - Integration with existing systems
   - Scalable architecture

### Demo Flow

1. **Start with Dashboard** (`/custom-buyer-portal`)
   - Show overview metrics
   - Demonstrate customer selector
   - Highlight quick actions

2. **Navigate to Customers** (`/custom-buyer-portal/customers`)
   - Show customer search and filtering
   - Display customer cards with metrics
   - Demonstrate pagination

3. **Show Analytics** (`/custom-buyer-portal/analytics`)
   - Display performance metrics
   - Show data visualization placeholders
   - Highlight reporting capabilities

4. **Compare with Embedded Portal** (`/buyer-portal`)
   - Show differences in approach
   - Highlight customization benefits
   - Discuss implementation trade-offs

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Data Integration**
   - Live BigCommerce API integration
   - Real-time order updates
   - Live inventory tracking

2. **Advanced Analytics**
   - Chart.js integration for visualizations
   - Custom reporting tools
   - Export functionality

3. **Additional Pages**
   - Complete order management
   - Quote creation workflow
   - Product catalog integration
   - Shipping and billing management

4. **Enhanced Features**
   - User role management
   - Advanced filtering and search
   - Bulk operations
   - Email notifications

### Technical Improvements

1. **Performance Optimization**
   - Data caching strategies
   - Lazy loading components
   - Optimized API calls

2. **Accessibility**
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader support

3. **Mobile Responsiveness**
   - Mobile-first design
   - Touch-friendly interfaces
   - Progressive Web App features

## 🤝 Support and Customization

### For Clients

This custom buyer portal serves as a foundation that can be:
- **Customized** to match brand requirements
- **Extended** with additional features
- **Integrated** with existing systems
- **Scaled** for enterprise needs

### For Developers

The codebase is designed to be:
- **Maintainable** with clear structure
- **Extensible** with modular components
- **Testable** with proper separation of concerns
- **Documented** for easy onboarding

## 📝 Notes

- This is a **demonstration implementation** showcasing B2B capabilities
- **Mock data** is used for UI demonstration
- **Real API integration** would require additional development
- **Production deployment** would need security and performance considerations

---

**Built with ❤️ using Catalyst and BigCommerce** 