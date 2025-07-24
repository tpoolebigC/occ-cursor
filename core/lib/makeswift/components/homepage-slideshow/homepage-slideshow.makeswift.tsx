import { Shape, Slot, TextInput, Number, Image, Link } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { MakeswiftHomepageSlideshow } from './homepage-slideshow.client';

export const COMPONENT_TYPE = 'catalyst-homepage-slideshow';

const slide = Shape({
  label: 'Slide',
  type: {
    title: TextInput({ label: 'Title', defaultValue: 'Discover what\'s new' }),
    subtitle: TextInput({ 
      label: 'Subtitle', 
      defaultValue: 'Shop our latest arrivals and find something fresh and exciting for your home.' 
    }),
    image: Image({ label: 'Background Image' }),
    buttonText: TextInput({ label: 'Button Text', defaultValue: 'Shop Now' }),
    buttonLink: Link({ label: 'Button Link' }),
    order: Number({ label: 'Order', defaultValue: 1 }),
  },
});

runtime.registerComponent(MakeswiftHomepageSlideshow, {
  type: COMPONENT_TYPE,
  label: 'Homepage Slideshow',
  props: {
    slides: Slot({ label: 'Slides' }),
    autoplay: Shape({
      label: 'Autoplay Settings',
      type: {
        enabled: TextInput({ label: 'Enabled', defaultValue: 'true' }),
        interval: Number({ label: 'Interval (seconds)', defaultValue: 5 }),
      },
    }),
  },
}); 