import { Color, Shape, Checkbox, TextInput } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../../base-colors';

const closeButton = Shape({
  type: {
    icon: Color({ label: 'Icon', defaultValue: hsl(colors.foreground, 0.5) }),
    iconHover: Color({ label: 'Icon hover', defaultValue: hsl(colors.foreground) }),
    background: Color({ label: 'Background', defaultValue: 'transparent' }),
    backgroundHover: Color({
      label: 'Background hover',
      defaultValue: hsl(colors.background, 0.4),
    }),
  },
});

export const banner = Shape({
  type: {
    show: Checkbox({ label: 'Show banner', defaultValue: false }),
    allowClose: Checkbox({ label: 'Allow close', defaultValue: true }),
    text: TextInput({ label: 'Banner text', defaultValue: 'Special offer!' }),
    backgroundColor: Color({ label: 'Background color', defaultValue: '#000000' }),
    textColor: Color({ label: 'Text color', defaultValue: '#ffffff' }),
  },
});
