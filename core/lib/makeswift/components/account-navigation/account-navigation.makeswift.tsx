'use client';

import { Style, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import AccountNavigation from './index';

interface Props {
  className?: string;
  activeSection?: string;
}

function MakeswiftAccountNavigation(props: Props) {
  return <AccountNavigation {...props} />;
}

runtime.registerComponent(MakeswiftAccountNavigation, {
  type: 'buyer-portal-account-navigation',
  label: 'Buyer Portal / Account Navigation',
  props: {
    className: Style(),
    activeSection: TextInput({ 
      label: 'Active section', 
      defaultValue: 'profile' 
    }),
  },
}); 