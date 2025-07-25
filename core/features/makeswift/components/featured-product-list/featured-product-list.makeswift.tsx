import { TextInput, Select, Number, Checkbox } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { MakeswiftFeaturedProductList } from './featured-product-list.client';

export const COMPONENT_TYPE = 'catalyst-featured-product-list';

runtime.registerComponent(MakeswiftFeaturedProductList, {
  type: COMPONENT_TYPE,
  label: 'Featured Product List',
  props: {
    title: TextInput({ 
      label: 'Section Title', 
      defaultValue: 'Featured Products' 
    }),
    description: TextInput({ 
      label: 'Section Description', 
      defaultValue: 'Discover our handpicked selection of premium products.' 
    }),
    productGroup: Select({
      label: 'Product Group',
      defaultValue: 'featured',
      options: [
        { label: 'Featured Products', value: 'featured' },
        { label: 'Best Selling Products', value: 'best-selling' },
        { label: 'Newest Products', value: 'newest' },
      ],
    }),
    maxProducts: Number({ 
      label: 'Maximum Products to Show', 
      defaultValue: 8 
    }),
    showPricing: Checkbox({
      label: 'Show Product Pricing',
      defaultValue: true,
    }),
    showRatings: Checkbox({
      label: 'Show Product Ratings',
      defaultValue: true,
    }),
    layout: Select({
      label: 'Layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
        { label: 'Masonry', value: 'masonry' },
      ],
      defaultValue: 'grid',
    }),
    columns: Select({
      label: 'Columns (Desktop)',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
        { label: '5 Columns', value: '5' },
      ],
      defaultValue: '4',
    }),
    ctaText: TextInput({ 
      label: 'CTA Button Text', 
      defaultValue: 'View All Products' 
    }),
    ctaLink: TextInput({ 
      label: 'CTA Button Link', 
      defaultValue: '/shop-all' 
    }),
  },
}); 