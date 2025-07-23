'use client';

import { Style, NumberInput, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import OrdersMetric from './index';

interface Props {
  className?: string;
  currentValue?: number;
  previousValue?: number;
  period?: string;
  title?: string;
}

function MakeswiftOrdersMetric(props: Props) {
  return <OrdersMetric {...props} />;
}

runtime.registerComponent(MakeswiftOrdersMetric, {
  type: 'buyer-portal-orders-metric',
  label: 'Buyer Portal / Orders Metric',
  props: {
    className: Style(),
    currentValue: NumberInput({ 
      label: 'Current value', 
      defaultValue: 342 
    }),
    previousValue: NumberInput({ 
      label: 'Previous value', 
      defaultValue: 298 
    }),
    period: TextInput({ 
      label: 'Period', 
      defaultValue: 'This Month' 
    }),
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Total Orders' 
    }),
  },
}); 