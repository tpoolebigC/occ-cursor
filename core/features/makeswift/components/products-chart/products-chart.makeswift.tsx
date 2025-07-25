'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import ProductsChart from './index';

interface Props {
  className?: string;
}

function MakeswiftProductsChart(props: Props) {
  return <ProductsChart />;
}

runtime.registerComponent(MakeswiftProductsChart, {
  type: 'buyer-portal-products-chart',
  label: 'Buyer Portal / Products Chart',
  props: {
    className: Style(),
  },
}); 