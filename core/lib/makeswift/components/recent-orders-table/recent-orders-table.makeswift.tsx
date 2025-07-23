'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import RecentOrdersTable from './index';

interface Props {
  className?: string;
}

function MakeswiftRecentOrdersTable(props: Props) {
  return <RecentOrdersTable {...props} />;
}

runtime.registerComponent(MakeswiftRecentOrdersTable, {
  type: 'buyer-portal-recent-orders-table',
  label: 'Buyer Portal / Recent Orders Table',
  props: {
    className: Style(),
  },
}); 