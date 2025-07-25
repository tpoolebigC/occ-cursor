'use client';

import { Style, Number, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
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
    currentValue: Number({ 
      label: 'Current value', 
      defaultValue: 342 
    }),
    previousValue: Number({ 
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