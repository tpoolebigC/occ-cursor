'use client';

import { Style, Checkbox, TextInput, Select } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';

interface Props {
  className?: string;
  placeholder?: string;
  showFacets?: boolean;
  showSuggestions?: boolean;
  searchProvider?: string;
  enableCompanyCatalogFilter?: boolean;
  pageSize?: string;
}

function MakeswiftUnifiedSearch(props: Props) {
  return (
    <div className={props.className}>
      <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-700">Unified Product Search</h3>
        <p className="text-sm text-blue-600 mt-1">
          Provider: {props.searchProvider || 'bigcommerce'}
        </p>
        <div className="mt-3 max-w-md mx-auto">
          <input
            type="text"
            placeholder={props.placeholder || 'Search products...'}
            className="w-full rounded-lg border border-blue-200 px-4 py-2 text-sm"
            disabled
          />
        </div>
        <div className="mt-3 text-xs text-blue-500 space-y-1">
          {props.showFacets && <p>Faceted filtering: enabled</p>}
          {props.showSuggestions !== false && <p>Autocomplete suggestions: enabled</p>}
          {props.enableCompanyCatalogFilter && <p>Company catalog filtering: enabled</p>}
        </div>
      </div>
    </div>
  );
}

runtime.registerComponent(MakeswiftUnifiedSearch as any, {
  type: 'buyer-portal-unified-search',
  label: 'Buyer Portal / Unified Search',
  props: {
    className: Style(),
    placeholder: TextInput({
      label: 'Search placeholder',
      defaultValue: 'Search products by name, SKU, or keyword...',
    }),
    showFacets: Checkbox({
      label: 'Show faceted filters',
      defaultValue: true,
    }),
    showSuggestions: Checkbox({
      label: 'Show autocomplete suggestions',
      defaultValue: true,
    }),
    searchProvider: Select({
      label: 'Search provider',
      options: [
        { value: 'bigcommerce', label: 'BigCommerce (default)' },
        { value: 'algolia', label: 'Algolia' },
        { value: 'searchspring', label: 'SearchSpring' },
        { value: 'custom', label: 'Custom' },
      ],
      defaultValue: 'bigcommerce',
    }),
    enableCompanyCatalogFilter: Checkbox({
      label: 'Filter by company catalog',
      defaultValue: false,
    }),
    pageSize: TextInput({
      label: 'Results per page',
      defaultValue: '20',
    }),
  },
});
