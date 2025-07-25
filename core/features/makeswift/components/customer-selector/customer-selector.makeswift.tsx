'use client';

import { TextInput, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { CustomerSelector } from './index';

export const COMPONENT_TYPE = 'buyer-portal-customer-selector';

runtime.registerComponent(CustomerSelector, {
  type: COMPONENT_TYPE,
  label: 'Customer Selector',
  props: {
    placeholder: TextInput({
      label: 'Placeholder Text',
      defaultValue: 'Select a customer...',
    }),
    showCompany: Checkbox({
      label: 'Show Company Name',
      defaultValue: true,
    }),
    showEmail: Checkbox({
      label: 'Show Email',
      defaultValue: false,
    }),
    allowSearch: Checkbox({
      label: 'Allow Search',
      defaultValue: true,
    }),
    limit: TextInput({
      label: 'Search Limit',
      defaultValue: '10',
    }),
  },
}); 