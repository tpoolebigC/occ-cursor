import { Number, Checkbox, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { BuyerPortalStatsClient } from './buyer-portal-stats.client';

export const COMPONENT_TYPE = 'catalyst-buyer-portal-stats';

runtime.registerComponent(BuyerPortalStatsClient, {
  type: COMPONENT_TYPE,
  label: 'Buyer Portal Stats',
  props: {
    columns: Number({
      label: 'Number of Columns',
      defaultValue: 4,
    }),
    showActiveOrders: Checkbox({
      label: 'Show Active Orders',
      defaultValue: true,
    }),
    showMonthlyRevenue: Checkbox({
      label: 'Show Monthly Revenue',
      defaultValue: true,
    }),
    showPendingQuotes: Checkbox({
      label: 'Show Pending Quotes',
      defaultValue: true,
    }),
    showTotalProducts: Checkbox({
      label: 'Show Total Products',
      defaultValue: true,
    }),
    activeOrdersCount: Number({
      label: 'Active Orders Count (Fallback)',
      defaultValue: 3,
    }),
    monthlyRevenue: TextInput({
      label: 'Monthly Revenue (Fallback)',
      defaultValue: '$12,450',
    }),
    pendingQuotesCount: Number({
      label: 'Pending Quotes Count (Fallback)',
      defaultValue: 2,
    }),
    totalProductsCount: Number({
      label: 'Total Products Count (Fallback)',
      defaultValue: 15,
    }),
  },
}); 