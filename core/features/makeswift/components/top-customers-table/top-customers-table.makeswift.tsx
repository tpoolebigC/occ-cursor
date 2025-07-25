'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import TopCustomersTable from './index';

interface Props {
  className?: string;
}

function MakeswiftTopCustomersTable(props: Props) {
  return <TopCustomersTable />;
}

runtime.registerComponent(MakeswiftTopCustomersTable, {
  type: 'buyer-portal-top-customers-table',
  label: 'Buyer Portal / Top Customers Table',
  props: {
    className: Style(),
  },
}); 