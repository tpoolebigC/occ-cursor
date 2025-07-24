import { Shape, TextInput, Link } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { MakeswiftFeaturedProductList } from './featured-product-list.client';

export const COMPONENT_TYPE = 'catalyst-featured-product-list';

runtime.registerComponent(MakeswiftFeaturedProductList, {
  type: COMPONENT_TYPE,
  label: 'Featured Product List',
  props: {
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Featured Products' 
    }),
    description: TextInput({ 
      label: 'Description', 
      defaultValue: 'Discover our handpicked selection of featured products.' 
    }),
    cta: Shape({
      label: 'Call to Action',
      type: {
        label: TextInput({ label: 'Button Text', defaultValue: 'Shop All' }),
        href: Link({ label: 'Button Link' }),
      },
    }),
    emptyStateTitle: TextInput({ 
      label: 'Empty State Title', 
      defaultValue: 'No featured products found' 
    }),
    emptyStateSubtitle: TextInput({ 
      label: 'Empty State Subtitle', 
      defaultValue: 'Check back later for new featured products.' 
    }),
  },
}); 