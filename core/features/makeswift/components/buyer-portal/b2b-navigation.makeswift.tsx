import { registerComponent } from '@makeswift/runtime/next';
import { TextInput } from '@makeswift/runtime/controls';

import { B2BNavigation } from '~/b2b/components/B2BNavigation';

registerComponent(B2BNavigation, {
  type: 'buyer-portal/b2b-navigation',
  label: 'B2B Navigation',
  props: {
    activeTab: TextInput({ label: 'Active Tab (optional)', defaultValue: 'dashboard' }),
  },
});


