'use client';

import { Style, TextInput, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import CatalogSearch from './index';

interface Props {
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
}

function MakeswiftCatalogSearch(props: Props) {
  return <CatalogSearch {...props} />;
}

runtime.registerComponent(MakeswiftCatalogSearch, {
  type: 'buyer-portal-catalog-search',
  label: 'Buyer Portal / Catalog Search',
  props: {
    className: Style(),
    placeholder: TextInput({ 
      label: 'Placeholder text', 
      defaultValue: 'Search products...' 
    }),
    showFilters: Checkbox({ 
      label: 'Show filters button', 
      defaultValue: true 
    }),
  },
}); 