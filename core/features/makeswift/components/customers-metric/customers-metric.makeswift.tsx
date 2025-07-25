'use client';

import { Style, Number, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import CustomersMetric from './index';

interface Props {
  className?: string;
  currentValue?: number;
  previousValue?: number;
  period?: string;
  title?: string;
}

function MakeswiftCustomersMetric(props: Props) {
  return <CustomersMetric {...props} />;
}

runtime.registerComponent(MakeswiftCustomersMetric, {
  type: 'buyer-portal-customers-metric',
  label: 'Buyer Portal / Customers Metric',
  props: {
    className: Style(),
    currentValue: Number({ 
      label: 'Current value', 
      defaultValue: 156 
    }),
    previousValue: Number({ 
      label: 'Previous value', 
      defaultValue: 142 
    }),
    period: TextInput({ 
      label: 'Period', 
      defaultValue: 'This Month' 
    }),
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Active Customers' 
    }),
  },
}); 