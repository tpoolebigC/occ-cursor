'use client';

import { ComponentPropsWithRef, ComponentRef, forwardRef, useReducer } from 'react';

import { Link as NavLink, useRouter } from '../../i18n/routing';

type NextLinkProps = Omit<ComponentPropsWithRef<typeof NavLink>, 'prefetch'>;

interface PrefetchOptions {
  prefetch?: 'hover' | 'viewport' | 'none';
  prefetchKind?: 'auto' | 'full';
}

type Props = NextLinkProps & PrefetchOptions;

/**
 * This custom `Link` is based on  Next-Intl's `Link` component
 * https://next-intl-docs.vercel.app/docs/routing/navigation#link
 * which adds automatically prefixes for the href with the current locale as necessary
 * and extends with additional prefetching controls, making navigation
 * prefetching more adaptable to different use cases. By offering `prefetch` and `prefetchKind`
 * props, it grants explicit management over when and how prefetching occurs, defaulting to 'hover' for
 * prefetch behavior and 'auto' for prefetch kind. This approach provides a balance between optimizing
 * page load performance and resource usage. https://nextjs.org/docs/app/api-reference/components/link#prefetch
 */
export const Link = forwardRef<ComponentRef<'a'>, Props>(
  ({ href, prefetch = 'hover', prefetchKind = 'auto', children, className, ...rest }, ref) => {
    let router: ReturnType<typeof useRouter> | undefined;
    let prefetchEnabled = false;
    
    try {
      router = useRouter();
      prefetchEnabled = true;
    } catch (error) {
      // If i18n context is not available, disable prefetching but still render the link
      console.warn('i18n context not available for Link component, prefetching disabled');
    }
    
    const [prefetched, setPrefetched] = useReducer(() => true, false);
    const computedPrefetch = prefetchEnabled ? computePrefetchProp({ prefetch, prefetchKind }) : false;

    const triggerPrefetch = () => {
      if (prefetched || !prefetchEnabled || !router) {
        return;
      }

      if (typeof href === 'string') {
        // PrefetchKind enum is not exported
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        router.prefetch(href, { kind: prefetchKind as any });
      } else {
        // PrefetchKind enum is not exported
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        router.prefetch(href.href || '', { kind: prefetchKind as any });
      }

      setPrefetched();
    };

    return (
      <NavLink
        className={className}
        href={href}
        onMouseEnter={prefetch === 'hover' && prefetchEnabled ? triggerPrefetch : undefined}
        onTouchStart={prefetch === 'hover' && prefetchEnabled ? triggerPrefetch : undefined}
        prefetch={computedPrefetch}
        ref={ref}
        {...rest}
      >
        {children}
      </NavLink>
    );
  },
);

function computePrefetchProp({
  prefetch,
  prefetchKind,
}: Required<PrefetchOptions>): boolean | undefined {
  if (prefetch !== 'viewport') {
    return false;
  }

  if (prefetchKind === 'auto') {
    return undefined;
  }

  return true;
}
