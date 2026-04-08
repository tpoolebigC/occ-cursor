'use client';

import { Style, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';

interface Props {
  className?: string;
  showCompanySelector?: boolean;
  showAddressSelector?: boolean;
}

function MakeswiftB2BHeaderBar(props: Props) {
  return (
    <div className={props.className}>
      <div className="flex items-center gap-4 rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-2">
        {props.showCompanySelector !== false && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Company</span>
            <span className="rounded border border-gray-300 px-2.5 py-1 text-sm text-gray-600">
              Acme Corp
            </span>
          </div>
        )}
        {props.showCompanySelector !== false && props.showAddressSelector !== false && (
          <div className="h-5 w-px bg-gray-300" />
        )}
        {props.showAddressSelector !== false && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ship To</span>
            <span className="rounded border border-gray-300 px-2.5 py-1 text-sm text-gray-600">
              123 Main St, City, ST 12345
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

runtime.registerComponent(MakeswiftB2BHeaderBar as any, {
  type: 'buyer-portal-b2b-header-bar',
  label: 'Buyer Portal / B2B Header Bar',
  props: {
    className: Style(),
    showCompanySelector: Checkbox({
      label: 'Show Company Selector',
      defaultValue: true,
    }),
    showAddressSelector: Checkbox({
      label: 'Show Address Selector',
      defaultValue: true,
    }),
  },
});
