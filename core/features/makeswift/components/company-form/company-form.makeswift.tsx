'use client';

import { Style } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import CompanyForm from './index';

interface Props {
  className?: string;
}

function MakeswiftCompanyForm(props: Props) {
  return <CompanyForm onSave={() => {}} />;
}

runtime.registerComponent(MakeswiftCompanyForm, {
  type: 'buyer-portal-company-form',
  label: 'Buyer Portal / Company Form',
  props: {
    className: Style(),
  },
}); 