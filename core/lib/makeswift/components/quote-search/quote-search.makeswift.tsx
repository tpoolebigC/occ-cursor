'use client';

import { Style, TextInput, Checkbox, NumberInput } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { QuoteSearch } from './index';

interface Props {
  className?: string;
  placeholder?: string;
  allowSearch?: boolean;
  debounceMs?: number;
}

function MakeswiftQuoteSearch(props: Props) {
  return <QuoteSearch {...props} />;
}

runtime.registerComponent(MakeswiftQuoteSearch, {
  type: 'buyer-portal-quote-search',
  label: 'Buyer Portal / Quote Search',
  props: {
    className: Style(),
    placeholder: TextInput({ 
      label: 'Placeholder text', 
      defaultValue: 'Search quotes...' 
    }),
    allowSearch: Checkbox({ 
      label: 'Enable search', 
      defaultValue: true 
    }),
    debounceMs: NumberInput({ 
      label: 'Debounce delay (ms)', 
      defaultValue: 300 
    }),
  },
}); 