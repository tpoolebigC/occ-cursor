'use client';

import { Style, NumberInput, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
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
    currentValue: NumberInput({ 
      label: 'Current value', 
      defaultValue: 125000 
    }),
    previousValue: NumberInput({ 
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