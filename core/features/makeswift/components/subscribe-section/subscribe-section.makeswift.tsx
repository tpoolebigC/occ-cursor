import { TextInput, Shape } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { MakeswiftSubscribeSection } from './subscribe-section.client';

export const COMPONENT_TYPE = 'catalyst-subscribe-section';

runtime.registerComponent(MakeswiftSubscribeSection, {
  type: COMPONENT_TYPE,
  label: 'Subscribe Section',
  props: {
    title: TextInput({ 
      label: 'Title', 
      defaultValue: 'Stay Updated' 
    }),
    description: TextInput({ 
      label: 'Description', 
      defaultValue: 'Subscribe to our newsletter for the latest updates and exclusive offers.' 
    }),
    placeholder: TextInput({ 
      label: 'Email Placeholder', 
      defaultValue: 'Enter your email address' 
    }),
    buttonText: TextInput({ 
      label: 'Button Text', 
      defaultValue: 'Subscribe' 
    }),
    successMessage: TextInput({ 
      label: 'Success Message', 
      defaultValue: 'Thank you for subscribing!' 
    }),
  },
}); 