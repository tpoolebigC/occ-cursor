import { TextInput, Select, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { MakeswiftButton } from './button.client';

export const COMPONENT_TYPE = 'catalyst-button';

runtime.registerComponent(MakeswiftButton, {
  type: COMPONENT_TYPE,
  label: 'Button',
  props: {
    children: TextInput({ 
      label: 'Button Text', 
      defaultValue: 'Click me' 
    }),
    variant: Select({
      label: 'Variant',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Tertiary', value: 'tertiary' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Danger', value: 'danger' },
      ],
      defaultValue: 'primary',
    }),
    size: Select({
      label: 'Size',
      options: [
        { label: 'Extra Small', value: 'x-small' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
      defaultValue: 'large',
    }),
    shape: Select({
      label: 'Shape',
      options: [
        { label: 'Pill', value: 'pill' },
        { label: 'Rounded', value: 'rounded' },
        { label: 'Square', value: 'square' },
        { label: 'Circle', value: 'circle' },
      ],
      defaultValue: 'pill',
    }),
    loading: Checkbox({
      label: 'Loading State',
      defaultValue: false,
    }),
    disabled: Checkbox({
      label: 'Disabled',
      defaultValue: false,
    }),
  },
}); 