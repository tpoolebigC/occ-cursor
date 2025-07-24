import { Number, Shape, Select } from '@makeswift/runtime/controls';

const widthGroup = (label: string) =>
  Shape({
    label,
    
    type: {
      medium: Number({ label: 'Medium', suffix: 'px', defaultValue: 768 }),
      lg: Number({ label: 'Large', suffix: 'px', defaultValue: 1024 }),
      xl: Number({ label: 'XL', suffix: 'px', defaultValue: 1200 }),
      '2xl': Number({ label: '2XL', suffix: 'px', defaultValue: 1536 }),
    },
  });

export const section = Shape({
  label: 'Section',
  type: {
    padding: Select({
      label: 'Padding',
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' },
      ],
      defaultValue: 'md',
    }),
    maxWidth: Select({
      label: 'Max width',
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' },
      ],
      defaultValue: 'lg',
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
