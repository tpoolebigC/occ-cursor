'use client';

import { Style, Number, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import RevenueMetric from './index';

interface Props {
  className?: string;
  currentValue?: number;
  previousValue?: number;
  period?: string;
  title?: string;
}

function MakeswiftRevenueMetric(props: Props) {
  return <RevenueMetric {...props} />;
}

runtime.registerComponent(MakeswiftRevenueMetric, {
  type: 'buyer-portal-revenue-metric',
  label: 'Buyer Portal / Revenue Metric',
  props: {
    className: Style(),
    currentValue: Number({ 
      label: 'Current value', 
      defaultValue: 125000 
    }),
    previousValue: Number({ 
      label: 'Previous value', 
      defaultValue: 110000 
    }),
    period: TextInput({ 
      label: 'Period', 
      defaultValue: 'This Month' 
    }),
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Total Revenue' 
    }),
  },
}); 