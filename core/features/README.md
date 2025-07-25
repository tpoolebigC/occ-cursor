# Features Architecture

This directory contains all feature modules organized by domain. Each feature is self-contained with its own components, hooks, services, types, and utilities.

## Structure

```
features/
├── b2b/                    # B2B Commerce Features
│   ├── components/         # B2B-specific UI components
│   ├── hooks/             # B2B React hooks
│   ├── services/          # B2B API and business logic
│   ├── types/             # B2B type definitions
│   ├── providers/         # B2B context providers
│   └── utils/             # B2B utility functions
├── algolia/               # Algolia Search Features
│   ├── components/        # Search UI components
│   ├── hooks/            # Search React hooks
│   ├── services/         # Algolia API services
│   ├── types/            # Search type definitions
│   ├── providers/        # Search context providers
│   └── utils/            # Search utility functions
└── makeswift/            # Makeswift Visual Editor
    ├── components/       # Visual editor components
    ├── hooks/           # Editor React hooks
    ├── services/        # Makeswift API services
    ├── types/           # Editor type definitions
    ├── providers/       # Editor context providers
    └── utils/           # Editor utility functions
```

## B2B Feature

The B2B feature module handles all business-to-business commerce functionality:

### Components
- Customer management interfaces
- Quote creation and management
- Order tracking and management
- Shopping list functionality
- Buyer portal dashboard

### Hooks
- `useB2BAuth` - Authentication and user management
- `useB2BSDK` - SDK integration and utilities
- `useB2BCart` - Cart synchronization
- `useB2BQuoteEnabled` - Quote feature detection
- `useB2BShoppingListEnabled` - Shopping list feature detection

### Services
- Authentication services
- Customer management APIs
- Quote and order APIs
- Shopping list APIs

### Types
- Customer and user types
- Quote and order types
- Shopping list types
- SDK interface types

## Algolia Feature

The Algolia feature module provides advanced search functionality:

### Components
- Search interfaces
- Faceted search components
- Search result displays
- Debug tools

### Hooks
- Search state management
- Facet filtering
- Search result handling

### Services
- Algolia client configuration
- Search API integration
- Index management
- Faceted search logic

### Types
- Search result types
- Facet types
- Search configuration types

## Makeswift Feature

The Makeswift feature module enables visual editing capabilities:

### Components
- Visual editor components
- Component registration
- Editor interfaces

### Hooks
- Editor state management
- Component lifecycle hooks

### Services
- Makeswift client configuration
- Page and component snapshots
- Runtime configuration

### Types
- Editor configuration types
- Component types
- Runtime types

## Usage

### Importing Features

```typescript
// Import specific B2B functionality
import { useB2BAuth, useB2BCart } from '~/features/b2b/hooks';
import { CustomerSelector } from '~/features/b2b/components';

// Import Algolia functionality
import { useAlgoliaSearch } from '~/features/algolia/hooks';
import { SearchResults } from '~/features/algolia/components';

// Import Makeswift functionality
import { MakeswiftProvider } from '~/features/makeswift/providers';
import { registerComponents } from '~/features/makeswift/utils';
```

### Feature Configuration

Each feature can be configured independently:

```typescript
// B2B Configuration
const b2bConfig = {
  features: {
    quotes: true,
    orders: true,
    shoppingLists: true,
  },
  permissions: {
    canCreateQuotes: true,
    canViewOrders: true,
  },
};

// Algolia Configuration
const algoliaConfig = {
  appId: process.env.ALGOLIA_APPLICATION_ID,
  searchKey: process.env.ALGOLIA_SEARCH_API_KEY,
  indexName: process.env.ALGOLIA_INDEX_NAME,
};

// Makeswift Configuration
const makeswiftConfig = {
  apiKey: process.env.MAKESWIFT_SITE_API_KEY,
  apiOrigin: process.env.MAKESWIFT_API_ORIGIN,
};
```

## Best Practices

1. **Feature Isolation**: Each feature should be self-contained with minimal dependencies on other features
2. **Type Safety**: Use TypeScript interfaces for all data structures
3. **Error Handling**: Implement proper error handling in services and hooks
4. **Documentation**: Document all public APIs and complex logic
5. **Testing**: Write tests for critical business logic and user interactions
6. **Performance**: Optimize for performance, especially in search and data fetching
7. **Accessibility**: Ensure all components meet accessibility standards

## Migration Guide

When migrating from the old structure:

1. **Update Imports**: Replace old import paths with new feature-based paths
2. **Refactor Components**: Move components to appropriate feature directories
3. **Update Types**: Use the new centralized type definitions
4. **Test Thoroughly**: Ensure all functionality works with the new structure
5. **Update Documentation**: Update any documentation referencing old paths

## Contributing

When adding new features:

1. Create a new feature directory following the established pattern
2. Implement components, hooks, services, and types
3. Add comprehensive documentation
4. Write tests for critical functionality
5. Update this README with new feature information 