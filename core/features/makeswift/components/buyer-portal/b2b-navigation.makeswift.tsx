import { TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { B2BNavigation } from '~/b2b/components/B2BNavigation';

runtime.registerComponent(B2BNavigation, {
  type: 'buyer-portal/b2b-navigation',
  label: 'B2B Navigation',
  props: {
    activeTab: TextInput({ label: 'Active Tab (optional)', defaultValue: 'dashboard' }),
  },
});


