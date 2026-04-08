import { Number as NumberControl, Select } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { UserManagementDashboard } from '~/b2b/components/UserManagementDashboard';

runtime.registerComponent(UserManagementDashboard, {
  type: 'buyer-portal/user-management-dashboard',
  label: 'User Management Dashboard',
  props: {
    companyId: NumberControl({ label: 'Company ID (optional)' }),
    defaultActiveTab: Select({
      label: 'Default Active Tab',
      options: [
        { label: 'Users', value: 'users' },
        { label: 'Company Hierarchy', value: 'hierarchy' },
      ],
      defaultValue: 'users',
    }),
  },
});
