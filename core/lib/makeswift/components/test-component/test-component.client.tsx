'use client';

import { forwardRef, type Ref } from 'react';

interface Props {
  text?: string;
}

export const TestComponent = forwardRef(
  ({ text = 'Hello World' }: Props, ref: Ref<HTMLDivElement>) => {
    return (
      <div ref={ref} className="p-4 bg-blue-100 border-2 border-blue-300 rounded">
        <h2>Test Component</h2>
        <p>{text}</p>
      </div>
    );
  },
);

TestComponent.displayName = 'TestComponent'; 