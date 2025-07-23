'use client';

import { Style, Checkbox, Combobox } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { QuoteStats } from './index';

interface Props {
  className?: string;
  showPending?: boolean;
  showApproved?: boolean;
  showExpired?: boolean;
  showTotal?: boolean;
  customerId?: string | null;
}

function MakeswiftQuoteStats(props: Props) {
  return <QuoteStats {...props} />;
}

runtime.registerComponent(MakeswiftQuoteStats, {
  type: 'buyer-portal-quote-stats',
  label: 'Buyer Portal / Quote Stats',
  props: {
    className: Style(),
    showPending: Checkbox({ 
      label: 'Show pending count', 
      defaultValue: true 
    }),
    showApproved: Checkbox({ 
      label: 'Show approved count', 
      defaultValue: true 
    }),
    showExpired: Checkbox({ 
      label: 'Show expired count', 
      defaultValue: true 
    }),
    showTotal: Checkbox({ 
      label: 'Show total value', 
      defaultValue: true 
    }),
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
  },
}); 