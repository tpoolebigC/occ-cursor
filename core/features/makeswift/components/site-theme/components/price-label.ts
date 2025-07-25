import { Color, Shape, Checkbox, Select } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    text: string;
    saleText: string;
  },
) =>
  Shape({
    type: {
      text: Color({ label: 'Text', defaultValue: defaults.text }),
      saleText: Color({ label: 'Sale text', defaultValue: defaults.saleText }),
    },
  });

export const priceLabel = Shape({
  type: {
    showOriginalPrice: Checkbox({ label: 'Show original price', defaultValue: true }),
    showSalePrice: Checkbox({ label: 'Show sale price', defaultValue: true }),
    showCurrency: Checkbox({ label: 'Show currency', defaultValue: true }),
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
