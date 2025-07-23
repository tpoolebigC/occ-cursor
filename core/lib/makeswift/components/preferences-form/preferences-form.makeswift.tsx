'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import PreferencesForm from './index';

interface Props {
  className?: string;
}

function MakeswiftPreferencesForm(props: Props) {
  return <PreferencesForm {...props} />;
}

runtime.registerComponent(MakeswiftPreferencesForm, {
  type: 'buyer-portal-preferences-form',
  label: 'Buyer Portal / Preferences Form',
  props: {
    className: Style(),
  },
}); 