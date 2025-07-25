import { Color, Number, Shape, Checkbox, Select } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../base-colors';

const colorGroup = (
  label: string,
  defaults: {
    background: string;
    title: string;
    subtitle: string;
  },
) =>
  Shape({
    type: {
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      title: Color({ label: 'Title', defaultValue: defaults.title }),
      subtitle: Color({ label: 'Subtitle', defaultValue: defaults.subtitle }),
    },
  });

export const productCard = Shape({
  type: {
    showImage: Checkbox({ label: 'Show image', defaultValue: true }),
    showTitle: Checkbox({ label: 'Show title', defaultValue: true }),
    showPrice: Checkbox({ label: 'Show price', defaultValue: true }),
    showRating: Checkbox({ label: 'Show rating', defaultValue: true }),
    showAddToCart: Checkbox({ label: 'Show add to cart', defaultValue: true }),
    showWishlist: Checkbox({ label: 'Show wishlist', defaultValue: true }),
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
