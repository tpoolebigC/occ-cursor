'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { strict } from 'assert';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { SearchResult } from '@/vibes/soul/primitives/navigation';

import { AlgoliaHit, algoliaResultsTransformer } from '~/data-transformers/algolia-search-results-transformer';
import algoliaClient from '~/lib/algolia/client';

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
    // Ensure the Algolia index name is set
    strict(process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME);

    console.log('🔍 [Algolia] Searching for:', submission.value.term);

    // Send the search term to Algolia instead of BigCommerce
    const algoliaResults = await algoliaClient.searchSingleIndex<AlgoliaHit>({
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME,
      searchParams: {
        query: submission.value.term,
        // Add any filters you want to apply to the search results
        filters: 'is_visible:true',
      },
    });

    console.log('✅ [Algolia] Found', algoliaResults.hits.length, 'results');

    return {
      lastResult: submission.reply(),
      // Transform the Algolia hits into SearchResult objects
      searchResults: await algoliaResultsTransformer(algoliaResults.hits),
      emptyStateTitle,
      emptyStateSubtitle,
    };
  } catch (error) {
    console.error('❌ [Algolia] Error during search:', error);

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
        searchResults: prevState.searchResults,
        emptyStateTitle,
        emptyStateSubtitle,
      };
    }

    return {
      lastResult: submission.reply({
        formErrors: [t('error')],
      }),
      searchResults: prevState.searchResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }
}
