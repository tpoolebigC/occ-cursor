import { Shape } from '@makeswift/runtime/controls';

import { fontFamilyTokens } from '~/lib/makeswift/controls/font-tokens';
import { runtime } from '~/features/makeswift/utils/runtime';

import { MakeswiftSiteTheme } from './client';
import components from './components';

export const COMPONENT_TYPE = 'catalyst-makeswift-theme-provider';

runtime.registerComponent(MakeswiftSiteTheme as any, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftSiteTheme (private)',
  hidden: true,
  props: {
    fontTokens: Shape({

      type: fontFamilyTokens,
    }),
    components: Shape({

      type: components,
    }),
  },
});
