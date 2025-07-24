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
      primary: 'bg-green-500 text-white border-green-500 hover:bg-green-600',
      secondary: 'bg-gray-800 text-white border-gray-800 hover:bg-gray-700',
      tertiary: 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50',
      ghost: 'bg-transparent text-gray-800 border-transparent hover:bg-gray-100',
      danger: 'bg-red-500 text-white border-red-500 hover:bg-red-600',
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