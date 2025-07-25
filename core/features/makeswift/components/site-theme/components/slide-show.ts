import { Color, Shape, Checkbox, Number } from '@makeswift/runtime/controls';

import { FontFamily } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

export const slideShow = Shape({
  type: {
    autoplay: Checkbox({ label: 'Autoplay', defaultValue: true }),
    autoplaySpeed: Number({ label: 'Autoplay speed (ms)', defaultValue: 5000 }),
    showArrows: Checkbox({ label: 'Show arrows', defaultValue: true }),
    showDots: Checkbox({ label: 'Show dots', defaultValue: true }),
    loop: Checkbox({ label: 'Loop', defaultValue: true }),
    fade: Checkbox({ label: 'Fade transition', defaultValue: false }),
  },
});
