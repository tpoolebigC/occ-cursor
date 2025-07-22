import { getFormatter, getTranslations } from 'next-intl/server';
import { createSearchParamsCache } from 'nuqs/server';
import { cache } from 'react';

import { Breadcrumb } from '@/vibes/soul/primitives/breadcrumbs';
import { CursorPaginationInfo } from '@/vibes/soul/primitives/cursor-pagination';
import { ListProduct } from '@/vibes/soul/primitives/products-list';
import { ProductsListSection } from '@/vibes/soul/sections/products-list-section';
import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { Filter } from '@/vibes/soul/sections/products-list-section/filters-panel';
import { Option as SortOption } from '@/vibes/soul/sections/products-list-section/sorting';
import { facetsTransformer } from '~/data-transformers/facets-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { fetchFacetedSearch } from '../fetch-faceted-search';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const createSearchSearchParamsCache = cache(async (props: Props) => {
  const searchParams = await props.searchParams;
  const search = await fetchFacetedSearch(searchParams);
  const searchFacets = search.facets.items;
  const transformedSearchFacets = await facetsTransformer({
    refinedFacets: searchFacets,
    allFacets: searchFacets,
    searchParams: {},
  });
  const searchFilters = transformedSearchFacets.filter((facet) => facet != null);
  const filterParsers = getFilterParsers(searchFilters);

  // If there are no filters, return `null`, since calling `createSearchParamsCache` with an empty
  // object will throw the following cryptic error:
  //
  // ```
  // Error: [nuqs] Empty search params cache. Search params can't be accessed in Layouts.
  //   See https://err.47ng.com/NUQS-500
  // ```
  if (Object.keys(filterParsers).length === 0) {
    return null;
  }

  return createSearchParamsCache(filterParsers);
});

async function getSearchTerm(props: Props): Promise<string> {
  const searchParams = await props.searchParams;
  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : '';

  console.log('🔍 [Search] getSearchTerm called with searchParams:', JSON.stringify(searchParams, null, 2));
  console.log('🔍 [Search] Extracted searchTerm:', searchTerm);

  return searchTerm;
}

async function getSearch(props: Props) {
  const searchParams = await props.searchParams;
  const searchParamsCache = await createSearchSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};
  const search = await fetchFacetedSearch({ ...searchParams, ...parsedSearchParams });

  return search;
}

async function getProducts(props: Props) {
  const searchTerm = await getSearchTerm(props);

  console.log('🔍 [Search] getProducts called with searchTerm:', searchTerm);

  // For empty search terms (Shop All), we still want to show products
  // The search will be handled by the fetchFacetedSearch function
  const search = await getSearch(props);

  console.log('🔍 [Search] getProducts found:', search.products.items.length, 'products');

  return search.products.items;
}

async function getTitle(props: Props): Promise<string> {
  const searchTerm = await getSearchTerm(props);
  const t = await getTranslations('Search');

  if (searchTerm === '') {
    return t('allProducts') || 'All Products';
  }

  return `${t('searchResults')} "${searchTerm}"`;
}

async function getFilters(props: Props): Promise<Filter[]> {
  const searchParams = await props.searchParams;
  const searchTerm = await getSearchTerm(props);
  const searchParamsCache = await createSearchSearchParamsCache(props);
  const parsedSearchParams = searchParamsCache?.parse(searchParams) ?? {};

  let refinedSearch: Awaited<ReturnType<typeof fetchFacetedSearch>> | null = null;

  if (searchTerm !== '') {
    refinedSearch = await fetchFacetedSearch({
      ...searchParams,
      ...parsedSearchParams,
    });
  }

  const categorySearch = await fetchFacetedSearch({});
  const allFacets = categorySearch.facets.items;

  const refinedFacets = refinedSearch?.facets.items ?? [];
  const transformedFacets = await facetsTransformer({
    refinedFacets,
    allFacets,
    searchParams: { ...searchParams, ...parsedSearchParams },
  });

  return transformedFacets.filter((facet) => facet != null);
}

async function getListProducts(props: Props): Promise<ListProduct[]> {
  const products = await getProducts(props);
  const format = await getFormatter();

  return products.map((product, index) => {
    // Debug: Log the first product's prices before transformer
    if (index === 0) {
      console.log('🔍 [Search] First product prices before transformer:', JSON.stringify(product.prices, null, 2));
    }
    
    return {
      id: product.entityId.toString(),
      title: product.name,
      href: product.path,
      image: product.defaultImage
        ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
        : undefined,
      price: pricesTransformer(product.prices, format),
      subtitle: product.brand?.name ?? undefined,
    };
  });
}

async function getTotalCount(props: Props): Promise<number> {
  const searchTerm = await getSearchTerm(props);

  // For empty search terms (Shop All), we still want to show the total count
  const search = await getSearch(props);

  return search.products.collectionInfo?.totalItems ?? 0;
}

async function getSortLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.SortBy');

  return t('ariaLabel');
}

async function getSortOptions(): Promise<SortOption[]> {
  const t = await getTranslations('FacetedGroup.SortBy');

  return [
    { value: 'featured', label: t('featuredItems') },
    { value: 'newest', label: t('newestItems') },
    { value: 'best_selling', label: t('bestSellingItems') },
    { value: 'a_to_z', label: t('aToZ') },
    { value: 'z_to_a', label: t('zToA') },
    { value: 'best_reviewed', label: t('byReview') },
    { value: 'lowest_price', label: t('priceAscending') },
    { value: 'highest_price', label: t('priceDescending') },
    { value: 'relevance', label: t('relevance') },
  ];
}

async function getPaginationInfo(props: Props): Promise<CursorPaginationInfo> {
  const searchTerm = await getSearchTerm(props);

  // For empty search terms (Shop All), we still want to show pagination
  const search = await getSearch(props);
  const { hasNextPage, hasPreviousPage, endCursor, startCursor } = search.products.pageInfo;

  return {
    startCursorParamName: 'before',
    endCursorParamName: 'after',
    endCursor: hasNextPage ? endCursor : null,
    startCursor: hasPreviousPage ? startCursor : null,
  };
}

async function getFilterLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getCompareLabel(): Promise<string> {
  const t = await getTranslations('Components.ProductCard.Compare');

  return t('compare');
}

async function getFiltersPanelTitle(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('filters');
}

async function getResetFiltersLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch');

  return t('resetFilters');
}

async function getRangeFilterApplyLabel(): Promise<string> {
  const t = await getTranslations('FacetedGroup.FacetedSearch.Range');

  return t('apply');
}

async function getEmptyStateTitle(props: Props): Promise<string> {
  const searchTerm = await getSearchTerm(props);
  const t = await getTranslations('Search');

  return t('emptyStateTitle', { term: searchTerm });
}

async function getEmptyStateSubtitle(): Promise<string> {
  const t = await getTranslations('Search');

  return t('emptyStateSubtitle');
}

async function getBreadcrumbs(): Promise<Breadcrumb[]> {
  const t = await getTranslations('Search');

  return [
    { label: t('Breadcrumbs.home'), href: '/' },
    { label: t('Breadcrumbs.search'), href: `#` },
  ];
}

export async function generateMetadata() {
  const t = await getTranslations('Search');

  return {
    title: t('title'),
  };
}

export default async function Search(props: Props) {
  return (
    <ProductsListSection
      breadcrumbs={getBreadcrumbs()}
      compareLabel={getCompareLabel()}
      emptyStateSubtitle={getEmptyStateSubtitle()}
      emptyStateTitle={getEmptyStateTitle(props)}
      filterLabel={await getFilterLabel()}
      filters={getFilters(props)}
      filtersPanelTitle={getFiltersPanelTitle()}
      paginationInfo={getPaginationInfo(props)}
      products={getListProducts(props)}
      rangeFilterApplyLabel={getRangeFilterApplyLabel()}
      resetFiltersLabel={getResetFiltersLabel()}
      sortDefaultValue="featured"
      sortLabel={getSortLabel()}
      sortOptions={getSortOptions()}
      sortParamName="sort"
      title={getTitle(props)}
      totalCount={getTotalCount(props)}
    />
  );
}
