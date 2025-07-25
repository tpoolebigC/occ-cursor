import { Color, Shape, TextInput, Link, Select } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    background: string;
    backgroundHover: string;
    foreground: string;
    border: string;
  },
) =>
  Shape({
    type: {
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      backgroundHover: Color({ label: 'Background hover', defaultValue: defaults.backgroundHover }),
      foreground: Color({ label: 'Foreground', defaultValue: defaults.foreground }),
      border: Color({ label: 'Border', defaultValue: defaults.border }),
    },
  });

export const button = Shape({
  type: {
    text: TextInput({ label: 'Text', defaultValue: 'Button' }),
    href: Link({ label: 'Link' }),
    variant: Select({
      label: 'Variant',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' },
        { value: 'ghost', label: 'Ghost' },
      ],
      defaultValue: 'primary',
    }),
    size: Select({
      label: 'Size',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ],
      defaultValue: 'md',
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
