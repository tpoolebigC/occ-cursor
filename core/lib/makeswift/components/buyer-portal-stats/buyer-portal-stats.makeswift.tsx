import { ReactRuntime } from '@makeswift/runtime/react';
import { MakeswiftComponentType } from '@makeswift/runtime';

import { BuyerPortalStatsClient } from './buyer-portal-stats.client';

export const runtime = ReactRuntime.createComponent(
  BuyerPortalStatsClient,
  {
    type: MakeswiftComponentType.Container,
    label: 'Buyer Portal Stats',
    props: {
      columns: {
        type: 'number',
        defaultValue: 4,
      },
      showActiveOrders: {
        type: 'boolean',
        defaultValue: true,
      },
      showMonthlyRevenue: {
        type: 'boolean',
        defaultValue: true,
      },
      showPendingQuotes: {
        type: 'boolean',
        defaultValue: true,
      },
      showTotalProducts: {
        type: 'boolean',
        defaultValue: true,
      },
      activeOrdersCount: {
        type: 'number',
        defaultValue: 3,
      },
      monthlyRevenue: {
        type: 'string',
        defaultValue: '$12,450',
      },
      pendingQuotesCount: {
        type: 'number',
        defaultValue: 2,
      },
      totalProductsCount: {
        type: 'number',
        defaultValue: 15,
      },
    },
  }
); 