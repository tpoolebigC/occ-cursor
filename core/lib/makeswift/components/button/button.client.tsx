'use client';

import { forwardRef, type Ref } from 'react';

interface Props {
  children: string;
  variant: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size: 'x-small' | 'small' | 'medium' | 'large';
  shape: 'pill' | 'rounded' | 'square' | 'circle';
  loading: boolean;
  disabled: boolean;
}

export const MakeswiftButton = forwardRef(
  ({ children, variant, size, shape, loading, disabled }: Props, ref: Ref<HTMLButtonElement>) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold border transition-colors';
    
    const variantClasses = {
      primary: 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)]',
      secondary: 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground)/0.9)]',
      tertiary: 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border-[hsl(var(--contrast-300))] hover:bg-[hsl(var(--contrast-100))]',
      ghost: 'bg-transparent text-[hsl(var(--foreground))] border-transparent hover:bg-[hsl(var(--contrast-100))]',
      danger: 'bg-[hsl(var(--error))] text-white border-[hsl(var(--error))] hover:bg-[hsl(var(--error)/0.9)]',
    };

    const sizeClasses = {
      'x-small': 'px-2 py-1 text-xs',
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-base',
    };

    const shapeClasses = {
      pill: 'rounded-full',
      rounded: 'rounded-lg',
      square: 'rounded-none',
      circle: 'rounded-full',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${shapeClasses[shape]}`}
        disabled={disabled || loading}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  },
);

MakeswiftButton.displayName = 'MakeswiftButton'; 