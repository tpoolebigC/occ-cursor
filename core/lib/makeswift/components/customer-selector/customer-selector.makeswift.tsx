'use client';

import { Combobox, Style, TextInput, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { CustomerSelector } from './index';

interface Props {
  className?: string;
  customerId?: string | null;
  placeholder?: string;
  showCompany?: boolean;
  showEmail?: boolean;
  allowSearch?: boolean;
  limit?: string;
}

function MakeswiftCustomerSelector(props: Props) {
  return <CustomerSelector {...props} />;
}

runtime.registerComponent(MakeswiftCustomerSelector, {
  type: 'buyer-portal-customer-selector',
  label: 'Buyer Portal / Customer Selector',
  props: {
    className: Style(),
    customerId: Combobox({
      label: 'Customer',
      async getOptions(query) {
        try {
          // This would be replaced with actual B2B API call
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
    placeholder: TextInput({ 
      label: 'Placeholder text', 
      defaultValue: 'Select a customer...' 
    }),
    showCompany: Checkbox({ 
      label: 'Show company name', 
      defaultValue: true 
    }),
    showEmail: Checkbox({ 
      label: 'Show email address', 
      defaultValue: false 
    }),
    allowSearch: Checkbox({ 
      label: 'Allow search', 
      defaultValue: true 
    }),
    limit: TextInput({ 
      label: 'Search result limit', 
      defaultValue: '10' 
    }),
  },
}); 