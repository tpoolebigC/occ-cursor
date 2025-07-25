'use client';

import { ReactRuntimeProvider, RootStyleRegistry } from '@makeswift/runtime/next';

import { runtime } from '~/features/makeswift/utils/runtime';
import '~/lib/makeswift/register-components';

export function MakeswiftProvider({
  children,
  previewMode,
}: {
  children: React.ReactNode;
  previewMode: boolean;
}) {
  return (
    <ReactRuntimeProvider previewMode={previewMode} runtime={runtime}>
      <RootStyleRegistry key="makeswift-styles">{children}</RootStyleRegistry>
    </ReactRuntimeProvider>
  );
}
