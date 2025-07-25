'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import RecentOrdersTable from './index';

interface Props {
  className?: string;
}

function MakeswiftRecentOrdersTable(props: Props) {
  return <RecentOrdersTable />;
}

runtime.registerComponent(MakeswiftRecentOrdersTable, {
  type: 'buyer-portal-recent-orders-table',
  label: 'Buyer Portal / Recent Orders Table',
  props: {
    className: Style(),
  },
}); 