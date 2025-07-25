'use client';

import { Combobox, Style, Checkbox, Select, Shape, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { OrderHistory } from './index';

interface Props {
  className?: string;
  customerId?: string | null;
  limit?: string;
  showStatus?: boolean;
  showPricing?: boolean;
  showDate?: boolean;
  showOrderNumber?: boolean;
  statusFilter?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

function MakeswiftOrderHistory(props: Props) {
  return <OrderHistory {...props} customerId={props.customerId?.toString()} />;
}

runtime.registerComponent(MakeswiftOrderHistory as any, {
  type: 'buyer-portal-order-history',
  label: 'Buyer Portal / Order History',
  props: {
    className: Style(),
    customerId: Combobox({
      label: 'Customer',
      async getOptions(query) {
        try {
          const response = await fetch(`/api/b2b/customers?search=${query || ''}`);
          const customers = await response.json();
          
          return customers.map((customer: any) => ({
            id: customer.id,
            label: `${customer.firstName} ${customer.lastName}${customer.company ? ` (${customer.company})` : ''}`,
            value: customer.id,
          }));
        } catch (error) {
          console.error('Error fetching customers:', error);
          return [];
        }
      },
    }),
    limit: TextInput({ 
      label: 'Number of orders to show', 
      defaultValue: '10' 
    }),
    showStatus: Checkbox({ 
      label: 'Show order status', 
      defaultValue: true 
    }),
    showPricing: Checkbox({ 
      label: 'Show pricing information', 
      defaultValue: true 
    }),
    showDate: Checkbox({ 
      label: 'Show order date', 
      defaultValue: true 
    }),
    showOrderNumber: Checkbox({ 
      label: 'Show order number', 
      defaultValue: true 
    }),
    statusFilter: Select({
      label: 'Status filter',
      options: [
        { value: '', label: 'All statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      defaultValue: '',
    }),
    dateRange: Shape({
      type: {
        startDate: Select({
          label: 'Start date',
          options: [
            { value: '', label: 'No filter' },
            { value: '7days', label: 'Last 7 days' },
            { value: '30days', label: 'Last 30 days' },
            { value: '90days', label: 'Last 90 days' },
            { value: '1year', label: 'Last year' },
          ],
          defaultValue: '',
        }),
        endDate: Select({
          label: 'End date',
          options: [
            { value: '', label: 'No filter' },
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'lastweek', label: 'Last week' },
            { value: 'lastmonth', label: 'Last month' },
          ],
          defaultValue: '',
        }),
      },
    }),
  },
}); 