'use client';

import { Style, TextInput, Checkbox, Number } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { OrderSearch } from './index';

interface Props {
  className?: string;
  placeholder?: string;
  allowSearch?: boolean;
  debounceMs?: number;
}

function MakeswiftOrderSearch(props: Props) {
  return <OrderSearch {...props} />;
}

runtime.registerComponent(MakeswiftOrderSearch, {
  type: 'buyer-portal-order-search',
  label: 'Buyer Portal / Order Search',
  props: {
    className: Style(),
    placeholder: TextInput({ 
      label: 'Placeholder text', 
      defaultValue: 'Search orders...' 
    }),
    allowSearch: Checkbox({ 
      label: 'Enable search', 
      defaultValue: true 
    }),
          debounceMs: Number({ 
      label: 'Debounce delay (ms)', 
      defaultValue: 300 
    }),
  },
}); 