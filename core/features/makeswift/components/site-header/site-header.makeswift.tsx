import {
  Checkbox,
  Image,
  Link,
  List,
  Number,
  Select,
  Shape,
  Slot,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/features/makeswift/utils/runtime';

import { MakeswiftHeader } from './site-header.client';

export const COMPONENT_TYPE = 'catalyst-makeswift-header';

const banner = Shape({

  type: {
    show: Checkbox({ label: 'Show banner', defaultValue: false }),
    allowClose: Checkbox({ label: 'Allow banner to close', defaultValue: true }),
    id: TextInput({ label: 'Banner ID', defaultValue: 'black_friday_2025' }),
    children: Slot(),
  },
});

const logoGroup = (
  label: string,
  defaults: {
    width: number;
    height: number;
  },
) =>
  Shape({

    type: {
      src: Image({ label: 'Logo' }),
      alt: TextInput({ label: 'Alt text', defaultValue: 'Logo alt' }),
      width: Number({ label: 'Max width', suffix: 'px', defaultValue: defaults.width }),
      height: Number({ label: 'Max height', suffix: 'px', defaultValue: defaults.height }),
    },
  });

const logo = Shape({

  type: {
    desktop: logoGroup('Desktop', { width: 200, height: 40 }),
    mobile: logoGroup('Mobile', { width: 100, height: 40 }),
    link: Link({ label: 'Logo link' }),
  },
});

const links = List({
  label: 'Links',
  type: Shape({
    type: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

const groups = List({
  label: 'Groups',
  type: Shape({

    type: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
      links,
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

runtime.registerComponent(MakeswiftHeader, {
  type: COMPONENT_TYPE,
  label: 'Site Header',
  hidden: true,
  props: {
    banner,
    logo,
    links: List({
      label: 'Additional links',
      type: Shape({
        type: {
          label: TextInput({ label: 'Text', defaultValue: 'Text' }),
          link: Link({ label: 'URL' }),
          groups,
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Text',
    }),
    linksPosition: Select({
      label: 'Links position',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
  },
});
