'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import CatalogSort from './index';

interface Props {
  className?: string;
}

function MakeswiftCatalogSort(props: Props) {
  return <CatalogSort {...props} />;
}

runtime.registerComponent(MakeswiftCatalogSort, {
  type: 'buyer-portal-catalog-sort',
  label: 'Buyer Portal / Catalog Sort',
  props: {
    className: Style(),
  },
}); 