'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import ProfileForm from './index';

interface Props {
  className?: string;
}

function MakeswiftProfileForm(props: Props) {
  return <ProfileForm {...props} />;
}

runtime.registerComponent(MakeswiftProfileForm, {
  type: 'buyer-portal-profile-form',
  label: 'Buyer Portal / Profile Form',
  props: {
    className: Style(),
  },
}); 