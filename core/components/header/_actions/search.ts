'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { SearchResult } from '@/vibes/soul/primitives/navigation';

/**
 * Header search action -- uses the unified SearchProvider (configured via SEARCH_PROVIDER env var).
 * This is provider-agnostic: works with BigCommerce GraphQL, Algolia, SearchSpring, or any custom provider.
 * No direct Algolia imports -- the provider factory handles that.
 */
export async function search(
  prevState: {
    lastResult: SubmissionResult | null;
    searchResults: SearchResult[] | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  formData: FormData,
): Promise<{
  lastResult: SubmissionResult | null;
  searchResults: SearchResult[] | null;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
}> {
  const t = await getTranslations('Components.Header.Search');
  const submission = parseWithZod(formData, { schema: z.object({ term: z.string() }) });
  const emptyStateTitle = t('noSearchResultsTitle', {
    term: submission.status === 'success' ? submission.value.term : '',
  });
  const emptyStateSubtitle = t('noSearchResultsSubtitle');

  if (submission.status !== 'success') {
    return {
      lastResult: submission.reply(),
      searchResults: prevState.searchResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }

  if (submission.value.term.length < 3) {
    return {
      lastResult: submission.reply(),
      searchResults: null,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }

  try {
    // Use the unified search provider (BigCommerce, Algolia, SearchSpring, etc.)
    const { getSearchProvider } = await import('~/lib/search/provider-factory');
    const provider = await getSearchProvider();

    const response = await provider.search({
      query: submission.value.term,
      pageSize: 10,
    });

    // Transform unified search results into the navigation SearchResult format
    const searchResults: SearchResult[] = [];

    if (response.products.length > 0) {
      searchResults.push({
        type: 'products',
        title: 'Products',
        products: response.products.map((p) => ({
          id: p.id,
          title: p.name,
          href: p.path || `/product/${p.id}`,
          price: p.price
            ? { type: 'sale' as const, currentValue: `$${p.price.toFixed(2)}`, previousValue: p.basePrice && p.basePrice > p.price ? `$${p.basePrice.toFixed(2)}` : '' }
            : undefined,
          image: p.imageUrl ? { src: p.imageUrl, alt: p.name } : undefined,
        })),
      });
    }

    return {
      lastResult: submission.reply(),
      searchResults: searchResults.length > 0 ? searchResults : [],
      emptyStateTitle,
      emptyStateSubtitle,
    };
  } catch (error) {
    console.error('Search error:', error);

    return {
      lastResult: submission.reply({
        formErrors: [t('somethingWentWrong')],
      }),
      searchResults: prevState.searchResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }
}
