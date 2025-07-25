'use client';

import { forwardRef, type Ref } from 'react';
import { Subscribe } from '~/components/subscribe';

interface Props {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
}

export const MakeswiftSubscribeSection = forwardRef(
  ({ title, description, placeholder, buttonText, successMessage }: Props, ref: Ref<HTMLDivElement>) => {
    return (
      <div ref={ref} style={{ width: '100%' }}>
        <Subscribe />
      </div>
    );
  },
);

MakeswiftSubscribeSection.displayName = 'MakeswiftSubscribeSection'; 