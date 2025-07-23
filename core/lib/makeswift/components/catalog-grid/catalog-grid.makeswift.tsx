'use client';

import { Style, NumberInput, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import CatalogGrid from './index';

interface Props {
  className?: string;
  itemsPerPage?: number;
  loading?: boolean;
}

function MakeswiftCatalogGrid(props: Props) {
  return <CatalogGrid {...props} />;
}

runtime.registerComponent(MakeswiftCatalogGrid, {
  type: 'buyer-portal-catalog-grid',
  label: 'Buyer Portal / Catalog Grid',
  props: {
    className: Style(),
    itemsPerPage: NumberInput({ 
      label: 'Items per page', 
      defaultValue: 12 
    }),
    loading: Checkbox({ 
      label: 'Show loading state', 
      defaultValue: false 
    }),
  },
}); 