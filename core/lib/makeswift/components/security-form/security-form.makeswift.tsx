'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import SecurityForm from './index';

interface Props {
  className?: string;
}

function MakeswiftSecurityForm(props: Props) {
  return <SecurityForm {...props} />;
}

runtime.registerComponent(MakeswiftSecurityForm, {
  type: 'buyer-portal-security-form',
  label: 'Buyer Portal / Security Form',
  props: {
    className: Style(),
  },
}); 