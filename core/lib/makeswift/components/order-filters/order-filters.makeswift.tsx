'use client';

import { Style, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { OrderFilters } from './index';

interface Props {
  className?: string;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  showCustomerFilter?: boolean;
}

function MakeswiftOrderFilters(props: Props) {
  return <OrderFilters {...props} />;
}

runtime.registerComponent(MakeswiftOrderFilters, {
  type: 'buyer-portal-order-filters',
  label: 'Buyer Portal / Order Filters',
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
  },
}); 