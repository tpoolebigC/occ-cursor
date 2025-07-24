import { TextInput, Number, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { BuyerPortalDashboardClient } from './buyer-portal-dashboard.client';

export const COMPONENT_TYPE = 'catalyst-buyer-portal-dashboard';

runtime.registerComponent(BuyerPortalDashboardClient, {
  type: COMPONENT_TYPE,
  label: 'Buyer Portal Dashboard',
  props: {
    title: TextInput({
      label: 'Title',
      defaultValue: 'Buyer Portal Dashboard',
    }),
    subtitle: TextInput({
      label: 'Subtitle',
      defaultValue: 'Manage your B2B customers, orders, and quotes',
    }),
    showCustomerSelector: Checkbox({
      label: 'Show Customer Selector',
      defaultValue: true,
    }),
    showOrderHistory: Checkbox({
      label: 'Show Order History',
      defaultValue: true,
    }),
    showQuickActions: Checkbox({
      label: 'Show Quick Actions',
      defaultValue: true,
    }),
    showStats: Checkbox({
      label: 'Show Stats',
      defaultValue: true,
    }),
    orderHistoryLimit: Number({
      label: 'Order History Limit',
      defaultValue: 5,
    }),
    statsColumns: Number({
      label: 'Stats Columns',
      defaultValue: 4,
    }),
  },
}); 