import { registerComponent } from '@makeswift/runtime/next';
import { Checkbox, Number as NumberControl, Select } from '@makeswift/runtime/controls';

import { UserManagementDashboard } from '~/b2b/components/UserManagementDashboard';

registerComponent(UserManagementDashboard, {
  type: 'buyer-portal/user-management-dashboard',
  label: 'User Management Dashboard',
  props: {
    companyId: NumberControl({ label: 'Company ID (optional)' }),
    // We will wire defaultActiveTab in the component below
  },
});


