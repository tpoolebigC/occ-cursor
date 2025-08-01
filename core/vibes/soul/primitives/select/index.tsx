'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ComponentPropsWithoutRef } from 'react';

export type SelectProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Root> &
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    colorScheme?: 'light' | 'dark';
    id?: string;
    pending?: boolean;
    placeholder?: string;
    label?: string;
    variant?: 'round' | 'rectangle';
    options: Array<{ label: string; value: string }>;
    onFocus?: (e: React.FocusEvent<HTMLButtonElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
    onOptionMouseEnter?: (value: string) => void;
    errors?: string[];
  };

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 *  :root {
 *    --select-light-trigger-background: hsl(var(--white));
 *    --select-light-trigger-border: hsl(var(--contrast-100));
 *    --select-light-trigger-border-hover: hsl(var(--contrast-300));
 *    --select-light-trigger-border-error: hsl(var(--error));
 *    --select-light-trigger-text: hsl(var(--foreground));
 *    --select-light-trigger-focus: hsl(var(--primary));
 *    --select-light-icon: hsl(var(--foreground));
 *    --select-light-content-background: hsl(var(--background));
 *    --select-light-item-background-hover: hsl(var(--contrast-100));
 *    --select-light-item-background-focus: hsl(var(--contrast-100));
 *    --select-light-item-text: hsl(var(--contrast-400));
 *    --select-light-item-text-hover: hsl(var(--foreground));
 *    --select-light-item-text-focus: hsl(var(--foreground));
 *    --select-light-item-checked-text-focus: hsl(var(--foreground));
 *    --select-dark-trigger-background: hsl(var(--black));
 *    --select-dark-trigger-border: hsl(var(--contrast-500));
 *    --select-dark-trigger-border-hover: hsl(var(--contrast-300));
 *    --select-dark-trigger-border-error: hsl(var(--error));
 *    --select-dark-trigger-text: hsl(var(--background));
 *    --select-dark-trigger-focus: hsl(var(--primary));
 *    --select-dark-icon: hsl(var(--background));
 *    --select-dark-content-background: hsl(var(--foreground));
 *    --select-dark-item-background-hover: hsl(var(--contrast-500));
 *    --select-dark-item-background-focus: hsl(var(--contrast-500));
 *    --select-dark-item-text: hsl(var(--contrast-200));
 *    --select-dark-item-text-hover: hsl(var(--background));
 *    --select-dark-item-text-focus: hsl(var(--background));
 *    --select-dark-item-checked-text-focus: hsl(var(--background));
 *  }
 * ```
 */
export function Select({
  value,
  name,
  id,
  required = false,
  pending = false,
  colorScheme = 'light',
  disabled,
  label,
  placeholder = 'Select an item',
  variant = 'rectangle',
  position = 'popper',
  side = 'bottom',
  sideOffset = 6,
  onFocus,
  onBlur,
  onOptionMouseEnter,
  onValueChange,
  errors,
  options,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      disabled={disabled}
      name={name}
      onValueChange={onValueChange}
      required={required}
      value={value}
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        className={clsx(
          'flex h-fit w-full select-none items-center justify-between gap-3 border p-2 px-5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
          variant === 'rectangle' ? 'rounded-lg' : 'rounded-full',
          {
            light:
              'bg-[var(--select-light-trigger-background,hsl(var(--white)))] text-[var(--select-light-trigger-text,hsl(var(--foreground)))] hover:border-[var(--select-light-trigger-border-hover,hsl(var(--contrast-300)))] hover:bg-[var(--select-light-trigger-background-hover,hsl(var(--contrast-100)))] focus-visible:ring-[var(--select-light-trigger-focus,hsl(var(--primary)))]',
            dark: 'bg-[var(--select-dark-trigger-background,hsl(var(--black)))] text-[var(--select-dark-trigger-text,hsl(var(--background)))] hover:border-[var(--select-dark-trigger-border-hover,hsl(var(--contrast-300)))] hover:bg-[var(--select-dark-trigger-background-hover,hsl(var(--contrast-500)))] focus-visible:ring-[var(--select-dark-trigger-focus,hsl(var(--primary)))]',
          }[colorScheme],
          {
            light:
              errors && errors.length > 0
                ? 'border-[var(--select-light-trigger-border-error,hsl(var(--error)))]'
                : 'border-[var(--select-light-trigger-border,hsl(var(--contrast-100)))]',
            dark:
              errors && errors.length > 0
                ? 'border-[var(--select-dark-trigger-border-error,hsl(var(--error)))]'
                : 'border-[var(--select-dark-trigger-border,hsl(var(--contrast-500)))]',
          }[colorScheme],
        )}
        data-pending={pending ? true : null}
        id={id}
        onBlur={onBlur}
        onFocus={onFocus}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            className={clsx(
              'w-5 transition-transform',
              {
                light: 'text-[var(--select-light-icon,hsl(var(--foreground)))]',
                dark: 'text-[var(--select-dark-icon,hsl(var(--background)))]',
              }[colorScheme],
            )}
            strokeWidth={1.5}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={clsx(
            'z-50 max-h-80 overflow-y-auto rounded-xl p-2 shadow-xl ring-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 @4xl:rounded-3xl @4xl:p-4',
            {
              popper: 'w-[var(--radix-select-trigger-width)]',
              'item-aligned': 'w-full',
            }[position],
            {
              light:
                'bg-[var(--select-light-content-background,hsl(var(--background)))] ring-[var(--select-light-content-border,hsl(var(--contrast-100)))]',
              dark: 'bg-[var(--select-dark-content-background,hsl(var(--foreground)))] ring-[var(--select-dark-content-border,hsl(var(--contrast-500)))]',
            }[colorScheme],
          )}
          position={position}
          side={side}
          sideOffset={sideOffset}
        >
          <SelectPrimitive.ScrollUpButton className="flex w-full cursor-default items-center justify-center py-3">
            <ChevronUp
              className={clsx(
                'w-5',
                {
                  light: 'text-[var(--select-light-icon,hsl(var(--foreground)))]',
                  dark: 'text-[var(--select-dark-icon,hsl(var(--background)))]',
                }[colorScheme],
              )}
              strokeWidth={1.5}
            />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                className={clsx(
                  'w-full cursor-default select-none rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors @4xl:text-base',
                  {
                    light:
                      'text-[var(--select-light-item-text,hsl(var(--contrast-400)))] hover:bg-[var(--select-light-item-background-hover,hsl(var(--contrast-100)))] hover:text-[var(--select-light-item-text-hover,hsl(var(--foreground)))] focus-visible:bg-[var(--select-light-item-background-focus,hsl(var(--contrast-100)))] focus-visible:text-[var(--select-light-item-text-focus,hsl(var(--foreground)))] data-[state=checked]:text-[var(--select-light-item-checked-text-focus,hsl(var(--foreground)))]',
                    dark: 'text-[var(--select-dark-item-text,hsl(var(--contrast-200)))] hover:bg-[var(--select-dark-item-background-hover,hsl(var(--contrast-500)))] hover:text-[var(--select-dark-item-text-hover,hsl(var(--background)))] focus-visible:bg-[var(--select-dark-item-background-focus,hsl(var(--contrast-500)))] focus-visible:text-[var(--select-dark-item-text-focus,hsl(var(--background)))] data-[state=checked]:text-[var(--select-dark-item-checked-text-focus,hsl(var(--background)))]',
                  }[colorScheme],
                )}
                key={option.value}
                onMouseEnter={() => {
                  onOptionMouseEnter?.(option.value);
                }}
                value={option.value}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex w-full cursor-default items-center justify-center py-3">
            <ChevronDown
              className={clsx(
                'w-5',
                {
                  light: 'text-[var(--select-icon,hsl(var(--foreground)))]',
                  dark: 'text-[var(--select-icon,hsl(var(--background)))]',
                }[colorScheme],
              )}
              strokeWidth={1.5}
            />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
