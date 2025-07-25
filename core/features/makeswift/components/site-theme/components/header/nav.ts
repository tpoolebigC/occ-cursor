import { Color, Shape, Checkbox, Select } from '@makeswift/runtime/controls';

import { FontFamily, type FontFamilyCssVar } from '~/lib/makeswift/controls/font-tokens';
import { hsl } from '~/lib/makeswift/utils/color';

import { colors } from '../../base-colors';

const elementGroup = (
  label: string,
  defaults: {
    fontFamily: FontFamilyCssVar;
    text: string;
    textHover: string;
    textSelected?: string;
    background: string;
    backgroundHover: string;
  },
) =>
  Shape({
    type: {
      fontFamily: FontFamily({ label: 'Font', defaultValue: defaults.fontFamily }),
      text: Color({ label: 'Text', defaultValue: defaults.text }),
      textHover: Color({ label: 'Text hover', defaultValue: defaults.textHover }),
      ...(defaults.textSelected && {
        textSelected: Color({ label: 'Text selected', defaultValue: defaults.textSelected }),
      }),
      background: Color({ label: 'Background', defaultValue: defaults.background }),
      backgroundHover: Color({ label: 'Background hover', defaultValue: defaults.backgroundHover }),
    },
  });

const button = Shape({
  type: {
    icon: Color({ label: 'Icon', defaultValue: hsl(colors.foreground) }),
    iconHover: Color({ label: 'Icon hover', defaultValue: hsl(colors.foreground) }),
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    backgroundHover: Color({ label: 'Background hover', defaultValue: hsl(colors.contrast[100]) }),
  },
});

const menu = Shape({
  type: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    border: Color({ label: 'Border', defaultValue: hsl(colors.foreground, 0.05) }),
  },
});

const mobile = Shape({
  type: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    divider: Color({ label: 'Divider', defaultValue: hsl(colors.contrast[100]) }),
    buttonIcon: Color({ label: 'Button icon', defaultValue: hsl(colors.foreground) }),
    link: elementGroup('Link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.foreground),
      textHover: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
    subLink: elementGroup('Sub-link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.contrast[500]),
      textHover: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
  },
});

const search = Shape({
  type: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    border: Color({ label: 'Border', defaultValue: hsl(colors.foreground, 0.05) }),
    divider: Color({ label: 'Divider', defaultValue: hsl(colors.foreground, 0.05) }),
    icon: Color({ label: 'Icon', defaultValue: hsl(colors.contrast[500]) }),
    emptyTitle: Color({ label: 'Empty title', defaultValue: hsl(colors.foreground) }),
    emptySubtitle: Color({ label: 'Empty subtitle', defaultValue: hsl(colors.contrast[500]) }),
  },
});

const searchResult = Shape({
  type: {
    title: Color({ label: 'Title', defaultValue: hsl(colors.foreground) }),
    titleFontFamily: FontFamily({ label: 'Title font', defaultValue: FontFamily.Accent }),
    link: elementGroup('Link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.foreground),
      textHover: hsl(colors.foreground),
      background: hsl(colors.background),
      backgroundHover: hsl(colors.contrast[100]),
    }),
  },
});

const cartCount = Shape({
  type: {
    text: Color({ label: 'Text', defaultValue: hsl(colors.background) }),
    background: Color({ label: 'Background', defaultValue: hsl(colors.foreground) }),
  },
});

const locale = Shape({
  type: {
    background: Color({ label: 'Background', defaultValue: hsl(colors.background) }),
    link: elementGroup('Link', {
      fontFamily: FontFamily.Body,
      text: hsl(colors.contrast[400]),
      textHover: hsl(colors.foreground),
      textSelected: hsl(colors.foreground),
      background: 'transparent',
      backgroundHover: hsl(colors.contrast[100]),
    }),
  },
});

export const nav = Shape({
  type: {
    showLogo: Checkbox({ label: 'Show logo', defaultValue: true }),
    showSearch: Checkbox({ label: 'Show search', defaultValue: true }),
    showCart: Checkbox({ label: 'Show cart', defaultValue: true }),
    showAccount: Checkbox({ label: 'Show account', defaultValue: true }),
    sticky: Checkbox({ label: 'Sticky header', defaultValue: false }),
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
