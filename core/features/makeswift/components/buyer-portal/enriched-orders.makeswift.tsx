'use client';

import { Style, Checkbox, TextInput, Select } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';

interface Props {
  className?: string;
  showErpOrderNumber?: boolean;
  showCompany?: boolean;
  showPoNumber?: boolean;
  showPaymentMethod?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  pageSize?: string;
  defaultSortBy?: string;
}

function MakeswiftEnrichedOrders(props: Props) {
  // This renders a message in the Makeswift builder -- the actual component
  // is rendered as a page in the custom-dashboard/orders route.
  return (
    <div className={props.className}>
      <div className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-indigo-700">Enriched Orders Table</h3>
        <p className="text-sm text-indigo-600 mt-1">
          Displays B2B orders with ERP Order # from BC V2 API.
        </p>
        <div className="mt-3 text-xs text-indigo-500 space-y-1">
          {props.showErpOrderNumber !== false && <p>ERP Order # column: enabled</p>}
          {props.showCompany !== false && <p>Company column: enabled</p>}
          {props.showPoNumber !== false && <p>PO # column: enabled</p>}
          {props.enableSearch !== false && <p>Search: enabled</p>}
          {props.enableFilters !== false && <p>Filters: enabled</p>}
          {props.enablePagination !== false && <p>Pagination: enabled ({props.pageSize || '25'}/page)</p>}
        </div>
      </div>
    </div>
  );
}

runtime.registerComponent(MakeswiftEnrichedOrders as any, {
  type: 'buyer-portal-enriched-orders',
  label: 'Buyer Portal / Enriched Orders Table',
  props: {
    className: Style(),
    showErpOrderNumber: Checkbox({
      label: 'Show ERP Order # column',
      defaultValue: true,
    }),
    showCompany: Checkbox({
      label: 'Show Company column',
      defaultValue: true,
    }),
    showPoNumber: Checkbox({
      label: 'Show PO # column',
      defaultValue: true,
    }),
    showPaymentMethod: Checkbox({
      label: 'Show Payment Method',
      defaultValue: false,
    }),
    enableSearch: Checkbox({
      label: 'Enable search bar',
      defaultValue: true,
    }),
    enableFilters: Checkbox({
      label: 'Enable filters (status, date)',
      defaultValue: true,
    }),
    enablePagination: Checkbox({
      label: 'Enable pagination',
      defaultValue: true,
    }),
    enableSorting: Checkbox({
      label: 'Enable column sorting',
      defaultValue: true,
    }),
    pageSize: TextInput({
      label: 'Results per page',
      defaultValue: '25',
    }),
    defaultSortBy: Select({
      label: 'Default sort',
      options: [
        { value: 'createdAt-DESC', label: 'Date (newest first)' },
        { value: 'createdAt-ASC', label: 'Date (oldest first)' },
        { value: 'totalIncTax-DESC', label: 'Total (highest first)' },
        { value: 'totalIncTax-ASC', label: 'Total (lowest first)' },
        { value: 'bcOrderId-DESC', label: 'Order # (highest first)' },
      ],
      defaultValue: 'createdAt-DESC',
    }),
  },
});
