import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'large' | 'medium' | 'small' | 'x-small';
  shape?: 'pill' | 'rounded' | 'square' | 'circle';
  loading?: boolean;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --button-focus: hsl(var(--primary));
 *   --button-font-family: var(--font-family-body);
 *   --button-primary-background: hsl(var(--primary));
 *   --button-primary-background-hover: color-mix(in oklab, hsl(var(--primary)), white 75%);
 *   --button-primary-text: hsl(var(--foreground));
 *   --button-primary-border: hsl(var(--primary));
 *   --button-secondary-background: hsl(var(--foreground));
 *   --button-secondary-background-hover: hsl(var(--background));
 *   --button-secondary-text: hsl(var(--background));
 *   --button-secondary-border: hsl(var(--foreground));
 *   --button-tertiary-background: hsl(var(--background));
 *   --button-tertiary-background-hover: hsl(var(--contrast-100));
 *   --button-tertiary-text: hsl(var(--foreground));
 *   --button-tertiary-border: hsl(var(--contrast-200));
 *   --button-ghost-background: transparent;
 *   --button-ghost-background-hover: hsl(var(--foreground) / 5%);
 *   --button-ghost-text: hsl(var(--foreground));
 *   --button-ghost-border: transparent;
 *   --button-loader-icon: hsl(var(--foreground));
 *   --button-danger-background: color-mix(in oklab, hsl(var(--error)), white 30%);
 *   --button-danger-background-hover: color-mix(in oklab, hsl(var(--error)), white 75%);
 *   --button-danger-foreground: hsl(var(--foreground));
 *   --button-danger-border: color-mix(in oklab, hsl(var(--error)), white 30%);
 * }
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'large',
  shape = 'pill',
  loading = false,
  type = 'button',
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading}
      className={clsx(
        'relative z-0 inline-flex h-fit cursor-pointer select-none items-center justify-center overflow-hidden border text-center font-[family-name:var(--font-family-body)] font-semibold leading-normal after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30',
        {
          primary:
            'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--foreground))] after:bg-[color-mix(in_oklab,hsl(var(--primary)),white_75%)]',
          secondary:
            'border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] after:bg-[hsl(var(--background))]',
          tertiary:
            'border-[hsl(var(--contrast-200))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] after:bg-[hsl(var(--contrast-100))]',
          ghost:
            'border-transparent bg-transparent text-[hsl(var(--foreground))] after:bg-[hsl(var(--foreground)/5%)]',
          danger:
            'border-[color-mix(in_oklab,hsl(var(--error)),white_30%)] bg-[color-mix(in_oklab,hsl(var(--error)),white_30%)] text-[hsl(var(--foreground))] after:bg-[color-mix(in_oklab,hsl(var(--error)),white_75%)]',
        }[variant],
        {
          pill: 'rounded-full after:rounded-full',
          rounded: 'rounded-lg after:rounded-lg',
          square: 'rounded-none after:rounded-none',
          circle: 'rounded-full after:rounded-full',
        }[shape],
        !loading && !disabled && 'hover:after:translate-x-0',
        loading && 'pointer-events-none',
        className,
      )}
      disabled={disabled}
      type={type}
    >
      <span
        className={clsx(
          'inline-flex items-center justify-center transition-all duration-300 ease-in-out',
          loading ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100',
          {
            'x-small': 'min-h-8 text-xs',
            small: 'min-h-10 text-sm',
            medium: 'min-h-12 text-base',
            large: 'min-h-14 text-base',
          }[size],
          shape === 'circle' &&
            {
              'x-small': 'min-w-8',
              small: 'min-w-10',
              medium: 'min-w-12',
              large: 'min-w-14',
            }[size],
          shape !== 'circle' &&
            {
              'x-small': 'gap-x-2 px-3 py-1.5',
              small: 'gap-x-2 px-4 py-2.5',
              medium: 'gap-x-2.5 px-5 py-3',
              large: 'gap-x-3 px-6 py-4',
            }[size],
          variant === 'secondary' && 'mix-blend-difference',
        )}
      >
        {children}
      </span>
      <span
        className={clsx(
          'absolute inset-0 grid place-content-center transition-all duration-300 ease-in-out',
          loading ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
        )}
      >
        <Loader2
          className={clsx(
            'animate-spin',
            variant === 'tertiary' && 'text-[hsl(var(--foreground))]',
          )}
        />
      </span>
    </button>
  );
}
