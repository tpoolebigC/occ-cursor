import { Slot } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { MakeswiftWrapper } from './makeswift-wrapper.client';

export const COMPONENT_TYPE = 'catalyst-makeswift-wrapper';

runtime.registerComponent(MakeswiftWrapper, {
  type: COMPONENT_TYPE,
  label: 'Component Wrapper',
  props: {
    children: Slot(),
  },
}); 