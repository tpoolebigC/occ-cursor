import { registerComponent } from '@makeswift/runtime/next';
import { Number as NumberControl, Checkbox, Select } from '@makeswift/runtime/controls';

import { CompanyHierarchy } from '~/b2b/components/CompanyHierarchy';

registerComponent(CompanyHierarchy, {
  type: 'buyer-portal/company-hierarchy',
  label: 'Company Hierarchy',
  props: {
    companyId: NumberControl({ label: 'Root Company ID (optional)' }),
  },
});


