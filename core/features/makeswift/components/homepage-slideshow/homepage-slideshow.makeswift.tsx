import { TextInput, Number, Image, Link, Select, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { MakeswiftHomepageSlideshow } from './homepage-slideshow.client';

export const COMPONENT_TYPE = 'catalyst-homepage-slideshow';

runtime.registerComponent(MakeswiftHomepageSlideshow, {
  type: COMPONENT_TYPE,
  label: 'Homepage Slideshow',
  props: {
    title: TextInput({ 
      label: 'Main Title', 
      defaultValue: 'Discover what\'s new' 
    }),
    subtitle: TextInput({ 
      label: 'Subtitle', 
      defaultValue: 'Shop our latest arrivals and find something fresh and exciting for your home.' 
    }),
    backgroundImage: Image({ label: 'Background Image' }),
    buttonText: TextInput({ 
      label: 'Button Text', 
      defaultValue: 'Shop Now' 
    }),
    buttonLink: Link({ label: 'Button Link' }),
    autoplay: Checkbox({
      label: 'Enable Autoplay',
      defaultValue: true,
    }),
    autoplayInterval: Number({ 
      label: 'Autoplay Interval (seconds)', 
      defaultValue: 5 
    }),
    height: Select({
      label: 'Height',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Full Screen', value: 'full' },
      ],
      defaultValue: 'large',
    }),
  },
}); 