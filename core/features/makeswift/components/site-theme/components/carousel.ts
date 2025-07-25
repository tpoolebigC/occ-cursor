import { Color, Shape, Checkbox, Number, Select } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    button: string;
    scrollbar: string;
  },
) =>
  Shape({
    type: {
      button: Color({ label: 'Button', defaultValue: defaults.button }),
      scrollbar: Color({ label: 'Scrollbar', defaultValue: defaults.scrollbar }),
    },
  });

export const carousel = Shape({
  type: {
    showButtons: Checkbox({ label: 'Show buttons', defaultValue: true }),
    showScrollbar: Checkbox({ label: 'Show scrollbar', defaultValue: true }),
    hideOverflow: Checkbox({ label: 'Hide overflow', defaultValue: true }),
    autoplay: Checkbox({ label: 'Autoplay', defaultValue: false }),
    autoplaySpeed: Number({ label: 'Autoplay speed (ms)', defaultValue: 3000 }),
    loop: Checkbox({ label: 'Loop', defaultValue: true }),
    align: Select({
      label: 'Alignment',
      options: [
        { value: 'start', label: 'Start' },
        { value: 'center', label: 'Center' },
        { value: 'end', label: 'End' },
      ],
      defaultValue: 'start',
    }),
  },
});
