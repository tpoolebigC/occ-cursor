'use client';

import { Combobox, Style, Checkbox, Select, Shape, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { QuoteList } from './index';

interface Props {
  className?: string;
  customerId?: string | null;
  limit?: string;
  showStatus?: boolean;
  showPricing?: boolean;
  showDate?: boolean;
  showQuoteNumber?: boolean;
  showCustomer?: boolean;
  showExpiry?: boolean;
  showActions?: boolean;
  allowPagination?: boolean;
  allowSorting?: boolean;
  statusFilter?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

function MakeswiftQuoteList(props: Props) {
  return <QuoteList {...props} />;
}

runtime.registerComponent(MakeswiftQuoteList, {
  type: 'buyer-portal-quote-list',
  label: 'Buyer Portal / Quote List',
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
      label: 'Number of quotes per page', 
      defaultValue: '20' 
    }),
    showStatus: Checkbox({ 
      label: 'Show quote status', 
      defaultValue: true 
    }),
    showPricing: Checkbox({ 
      label: 'Show pricing information', 
      defaultValue: true 
    }),
    showDate: Checkbox({ 
      label: 'Show creation date', 
      defaultValue: true 
    }),
    showQuoteNumber: Checkbox({ 
      label: 'Show quote number', 
      defaultValue: true 
    }),
    showCustomer: Checkbox({ 
      label: 'Show customer information', 
      defaultValue: true 
    }),
    showExpiry: Checkbox({ 
      label: 'Show expiry date', 
      defaultValue: true 
    }),
    showActions: Checkbox({ 
      label: 'Show action buttons', 
      defaultValue: true 
    }),
    allowPagination: Checkbox({ 
      label: 'Enable pagination', 
      defaultValue: true 
    }),
    allowSorting: Checkbox({ 
      label: 'Enable column sorting', 
      defaultValue: true 
    }),
    statusFilter: Select({
      label: 'Status filter',
      options: [
        { value: '', label: 'All statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'expired', label: 'Expired' },
        { value: 'rejected', label: 'Rejected' },
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