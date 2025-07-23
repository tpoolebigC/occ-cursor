'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import CatalogFilters from './index';

interface Props {
  className?: string;
}

function MakeswiftCatalogFilters(props: Props) {
  return <CatalogFilters {...props} />;
}

runtime.registerComponent(MakeswiftCatalogFilters, {
  type: 'buyer-portal-catalog-filters',
  label: 'Buyer Portal / Catalog Filters',
  props: {
    className: Style(),
  },
}); 