'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import ProductsChart from './index';

interface Props {
  className?: string;
}

function MakeswiftProductsChart(props: Props) {
  return <ProductsChart {...props} />;
}

runtime.registerComponent(MakeswiftProductsChart, {
  type: 'buyer-portal-products-chart',
  label: 'Buyer Portal / Products Chart',
  props: {
    className: Style(),
  },
}); 