'use client';

import { Style, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { QuoteFilters } from './index';

interface Props {
  className?: string;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showCustomerFilter?: boolean;
  showExpiryFilter?: boolean;
}

function MakeswiftQuoteFilters(props: Props) {
  return <QuoteFilters {...props} />;
}

runtime.registerComponent(MakeswiftQuoteFilters, {
  type: 'buyer-portal-quote-filters',
  label: 'Buyer Portal / Quote Filters',
  props: {
    className: Style(),
    showStatusFilter: Checkbox({ 
      label: 'Show status filter', 
      defaultValue: true 
    }),
    showDateFilter: Checkbox({ 
      label: 'Show date filter', 
      defaultValue: true 
    }),
    showCustomerFilter: Checkbox({ 
      label: 'Show customer filter', 
      defaultValue: true 
    }),
    showExpiryFilter: Checkbox({ 
      label: 'Show expiry filter', 
      defaultValue: true 
    }),
  },
}); 