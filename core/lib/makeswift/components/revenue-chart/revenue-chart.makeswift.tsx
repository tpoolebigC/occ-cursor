'use client';

import { Style, Number } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import RevenueChart from './index';

interface Props {
  className?: string;
  height?: number;
}

function MakeswiftRevenueChart(props: Props) {
  return <RevenueChart {...props} />;
}

runtime.registerComponent(MakeswiftRevenueChart, {
  type: 'buyer-portal-revenue-chart',
  label: 'Buyer Portal / Revenue Chart',
  props: {
    className: Style(),
    height: Number({
      label: 'Chart height',
      defaultValue: 300,
    }),
  },
}); 