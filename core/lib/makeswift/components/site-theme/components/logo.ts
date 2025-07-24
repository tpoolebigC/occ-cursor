import { Color, Shape, TextInput, Number, Image } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

export const logo = Shape({
  label: 'Logo',
  type: {
    src: Image({ label: 'Logo' }),
    alt: TextInput({ label: 'Alt text', defaultValue: 'Logo' }),
    width: Number({ label: 'Width', suffix: 'px', defaultValue: 200 }),
    height: Number({ label: 'Height', suffix: 'px', defaultValue: 40 }),
  },
});
