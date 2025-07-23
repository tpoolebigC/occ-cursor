'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import SegmentsChart from './index';

interface Props {
  className?: string;
}

function MakeswiftSegmentsChart(props: Props) {
  return <SegmentsChart {...props} />;
}

runtime.registerComponent(MakeswiftSegmentsChart, {
  type: 'buyer-portal-segments-chart',
  label: 'Buyer Portal / Segments Chart',
  props: {
    className: Style(),
  },
}); 