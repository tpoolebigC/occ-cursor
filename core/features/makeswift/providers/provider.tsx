'use client';

import { ReactRuntimeProvider, RootStyleRegistry } from '@makeswift/runtime/next';

import { runtime } from '../utils/runtime';
import '../utils/register-components';

/**
 * Makeswift Provider Component
 * Provides Makeswift runtime context and styling for visual editing
 */
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