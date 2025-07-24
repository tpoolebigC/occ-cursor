import { ReactRuntime } from '@makeswift/runtime/react';
import { MakeswiftComponentType } from '@makeswift/runtime';

import { BuyerPortalDashboardClient } from './buyer-portal-dashboard.client';

export const runtime = ReactRuntime.createComponent(
  BuyerPortalDashboardClient,
  {
    type: MakeswiftComponentType.Container,
    label: 'Buyer Portal Dashboard',
    props: {
      title: {
        type: 'string',
        defaultValue: 'Buyer Portal Dashboard',
      },
      subtitle: {
        type: 'string',
        defaultValue: 'Manage your B2B customers, orders, and quotes',
      },
      showCustomerSelector: {
        type: 'boolean',
        defaultValue: true,
      },
      showOrderHistory: {
        type: 'boolean',
        defaultValue: true,
      },
      showQuickActions: {
        type: 'boolean',
        defaultValue: true,
      },
      showStats: {
        type: 'boolean',
        defaultValue: true,
      },
      orderHistoryLimit: {
        type: 'number',
        defaultValue: 5,
      },
      statsColumns: {
        type: 'number',
        defaultValue: 4,
      },
    },
  }
); 