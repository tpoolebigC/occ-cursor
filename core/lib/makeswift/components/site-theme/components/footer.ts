import { Color, Shape, Checkbox, Select } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

export const footer = Shape({
  label: 'Footer',
  type: {
    showLogo: Checkbox({ label: 'Show logo', defaultValue: true }),
    showSocialLinks: Checkbox({ label: 'Show social links', defaultValue: true }),
    showNewsletter: Checkbox({ label: 'Show newsletter', defaultValue: true }),
    colorScheme: Select({
      label: 'Color scheme',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      defaultValue: 'dark',
    }),
  },
});
