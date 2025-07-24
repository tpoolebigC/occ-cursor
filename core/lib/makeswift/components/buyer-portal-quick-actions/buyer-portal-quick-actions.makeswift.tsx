import { ReactRuntime } from '@makeswift/runtime/react';
import { MakeswiftComponentType } from '@makeswift/runtime';

import { BuyerPortalQuickActionsClient } from './buyer-portal-quick-actions.client';

export const runtime = ReactRuntime.createComponent(
  BuyerPortalQuickActionsClient,
  {
    type: MakeswiftComponentType.Container,
    label: 'Buyer Portal Quick Actions',
    props: {
      showCreateQuote: {
        type: 'boolean',
        defaultValue: true,
      },
      showBrowseCatalog: {
        type: 'boolean',
        defaultValue: true,
      },
      showAccountSettings: {
        type: 'boolean',
        defaultValue: true,
      },
      createQuoteText: {
        type: 'string',
        defaultValue: 'Create New Quote',
      },
      createQuoteDescription: {
        type: 'string',
        defaultValue: 'Request pricing for products',
      },
      browseCatalogText: {
        type: 'string',
        defaultValue: 'Browse Catalog',
      },
      browseCatalogDescription: {
        type: 'string',
        defaultValue: 'View available products',
      },
      accountSettingsText: {
        type: 'string',
        defaultValue: 'Account Settings',
      },
      accountSettingsDescription: {
        type: 'string',
        defaultValue: 'Manage customer information',
      },
    },
  }
); 