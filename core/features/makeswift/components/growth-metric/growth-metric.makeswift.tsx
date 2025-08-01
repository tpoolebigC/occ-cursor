'use client';

import { Style, Number, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import GrowthMetric from './index';

interface Props {
  className?: string;
  currentValue?: number;
  previousValue?: number;
  period?: string;
  title?: string;
}

function MakeswiftGrowthMetric(props: Props) {
  return <GrowthMetric {...props} />;
}

runtime.registerComponent(MakeswiftGrowthMetric, {
  type: 'buyer-portal-growth-metric',
  label: 'Buyer Portal / Growth Metric',
  props: {
    className: Style(),
    currentValue: Number({ 
      label: 'Current value', 
      defaultValue: 13.6 
    }),
    previousValue: Number({ 
      label: 'Previous value', 
      defaultValue: 8.2 
    }),
    period: TextInput({ 
      label: 'Period', 
      defaultValue: 'This Month' 
    }),
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Growth Rate' 
    }),
  },
}); 