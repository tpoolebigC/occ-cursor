import { Shape, TextInput, Link, Select, Number } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { MakeswiftFeaturedProductCarousel } from './featured-product-carousel.client';

export const COMPONENT_TYPE = 'catalyst-featured-product-carousel';

runtime.registerComponent(MakeswiftFeaturedProductCarousel as any, {
  type: COMPONENT_TYPE,
  label: 'Featured Product Carousel',
  props: {
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Newest Products' 
    }),
    description: TextInput({ 
      label: 'Description', 
      defaultValue: 'Check out our latest arrivals.' 
    }),
    productGroup: Select({
      label: 'Product Group',
      defaultValue: 'newest',
      options: [
        { label: 'Newest Products', value: 'newest' },
        { label: 'Best Selling Products', value: 'best-selling' },
        { label: 'Featured Products', value: 'featured' },
      ],
    }),
    maxProducts: Number({
      label: 'Maximum Products',
      defaultValue: 12,
    }),
    cta: Shape({
      type: {
        label: TextInput({ label: 'Button Text', defaultValue: 'Shop All' }),
        href: Link({ label: 'Button Link' }),
      },
    }),
    nextLabel: TextInput({ 
      label: 'Next Button Label', 
      defaultValue: 'Next products' 
    }),
    previousLabel: TextInput({ 
      label: 'Previous Button Label', 
      defaultValue: 'Previous products' 
    }),
    emptyStateTitle: TextInput({ 
      label: 'Empty State Title', 
      defaultValue: 'No newest products found' 
    }),
    emptyStateSubtitle: TextInput({ 
      label: 'Empty State Subtitle', 
      defaultValue: 'Check back later for new products.' 
    }),
  },
}); 