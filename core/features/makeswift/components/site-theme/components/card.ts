import { Color, Number, Shape, Checkbox, Select } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    background: string;
    text: string;
    icon: string;
  },
) =>
  Shape({
    type: {
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      text: Color({ label: 'Text', defaultValue: defaults.text }),
      icon: Color({ label: 'Icon', defaultValue: defaults.icon }),
    },
  });

export const card = Shape({
  type: {
    showImage: Checkbox({ label: 'Show image', defaultValue: true }),
    showTitle: Checkbox({ label: 'Show title', defaultValue: true }),
    showDescription: Checkbox({ label: 'Show description', defaultValue: true }),
    showPrice: Checkbox({ label: 'Show price', defaultValue: true }),
    showButton: Checkbox({ label: 'Show button', defaultValue: true }),
    aspectRatio: Select({
      label: 'Aspect ratio',
      options: [
        { value: '1:1', label: 'Square' },
        { value: '5:6', label: '5:6' },
        { value: '3:4', label: '3:4' },
      ],
      defaultValue: '5:6',
    }),
    colorScheme: Select({
      label: 'Color scheme',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      defaultValue: 'light',
    }),
  },
});
