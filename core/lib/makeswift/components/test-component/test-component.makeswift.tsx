import { TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { TestComponent } from './test-component.client';

export const COMPONENT_TYPE = 'catalyst-test-component';

runtime.registerComponent(TestComponent, {
  type: COMPONENT_TYPE,
  label: 'Test Component',
  props: {
    text: TextInput({ 
      label: 'Text', 
      defaultValue: 'Hello World' 
    }),
  },
}); 