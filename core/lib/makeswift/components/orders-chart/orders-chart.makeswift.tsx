'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import OrdersChart from './index';

interface Props {
  className?: string;
}

function MakeswiftOrdersChart(props: Props) {
  return <OrdersChart {...props} />;
}

runtime.registerComponent(MakeswiftOrdersChart, {
  type: 'buyer-portal-orders-chart',
  label: 'Buyer Portal / Orders Chart',
  props: {
    className: Style(),
  },
}); 