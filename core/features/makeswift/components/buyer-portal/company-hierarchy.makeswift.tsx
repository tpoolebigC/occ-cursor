import { Number as NumberControl, Checkbox, Select } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { CompanyHierarchy } from '~/b2b/components/CompanyHierarchy';

runtime.registerComponent(CompanyHierarchy, {
  type: 'buyer-portal/company-hierarchy',
  label: 'Company Hierarchy',
  props: {
    companyId: NumberControl({ label: 'Root Company ID (optional)' }),
  },
});


