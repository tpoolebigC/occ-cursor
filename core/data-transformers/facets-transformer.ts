/* eslint-disable complexity */
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { fetchAlgoliaFacetedSearch } from '~/features/algolia/services/faceted-search';
import { ExistingResultType } from '~/client/util';

// Import the schema types from the old file for compatibility
import { PublicSearchParamsSchema, PublicToPrivateParams } from '~/app/[locale]/(default)/(faceted)/fetch-faceted-search';

export const facetsTransformer = async ({
  refinedFacets,
  allFacets,
  searchParams,
}: {
  refinedFacets: ExistingResultType<typeof fetchAlgoliaFacetedSearch>['facets']['items'];
  allFacets: ExistingResultType<typeof fetchAlgoliaFacetedSearch>['facets']['items'];
  searchParams: z.input<typeof PublicSearchParamsSchema>;
}) => {
  const t = await getTranslations('Faceted.FacetedSearch.Facets');
  const { filters } = PublicToPrivateParams.parse(searchParams);

  return allFacets.map((facet) => {
    const refinedFacet = refinedFacets.find((f) => f.name === facet.name);

    if (facet.__typename === 'CategorySearchFilter') {
      const refinedCategorySearchFilter =
        refinedFacet?.__typename === 'CategorySearchFilter' ? refinedFacet : null;

      return {
        type: 'toggle-group' as const,
        paramName: 'categoryIn',
        label: facet.name,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.categories?.map((category) => {
          const refinedCategory = refinedCategorySearchFilter?.categories?.find(
            (c) => c.entityId === category.entityId,
          );
          const isSelected = filters.categoryEntityIds?.includes(category.entityId) === true;

          return {
            label: category.name,
            value: category.entityId.toString(),
            disabled: refinedCategory == null && !isSelected,
          };
        }) || [],
      };
    }

    if (facet.__typename === 'BrandSearchFilter') {
      const refinedBrandSearchFilter =
        refinedFacet?.__typename === 'BrandSearchFilter' ? refinedFacet : null;

      return {
        type: 'toggle-group' as const,
        paramName: 'brand',
        label: facet.name,
        defaultCollapsed: facet.isCollapsedByDefault,
        options: facet.brands?.map((brand) => {
          const refinedBrand = refinedBrandSearchFilter?.brands?.find(
            (b) => b.entityId === brand.entityId,
          );
          const isSelected = filters.brandEntityIds?.includes(brand.entityId) === true;

          return {
            label: brand.name,
            value: brand.entityId.toString(),
            disabled: refinedBrand == null && !isSelected,
          };
        }) || [],
      };
    }

    if (facet.__typename === 'ProductAttributeSearchFilter') {
      const refinedProductAttributeSearchFilter =
        refinedFacet?.__typename === 'ProductAttributeSearchFilter' ? refinedFacet : null;

      return {
        type: 'toggle-group' as const,
        paramName: `attr_${facet.name || 'attribute'}`,
        label: facet.name || 'Attribute',
        options: facet.attributes?.map((attribute) => {
          const refinedAttribute = refinedProductAttributeSearchFilter?.attributes?.find(
            (a) => a.value === attribute.value,
          );

          const isSelected =
            filters.productAttributes?.some((attr) => attr.values.includes(attribute.value)) ===
            true;

          return {
            label: attribute.value,
            value: attribute.value,
            disabled: refinedAttribute == null && !isSelected,
          };
        }) || [],
      };
    }

    if (facet.__typename === 'RatingSearchFilter') {
      const refinedRatingSearchFilter =
        refinedFacet?.__typename === 'RatingSearchFilter' ? refinedFacet : null;
      const isSelected = filters.rating?.minRating != null;

      return {
        type: 'rating' as const,
        paramName: 'minRating',
        label: facet.name,
        disabled: refinedRatingSearchFilter == null && !isSelected,
      };
    }

    if (facet.__typename === 'PriceSearchFilter') {
      const refinedPriceSearchFilter =
        refinedFacet?.__typename === 'PriceSearchFilter' ? refinedFacet : null;
      const isSelected = filters.price?.minPrice != null || filters.price?.maxPrice != null;

      return {
        type: 'range' as const,
        minParamName: 'minPrice',
        maxParamName: 'maxPrice',
        label: facet.name,
        min: facet.selected?.minPrice ?? undefined,
        max: facet.selected?.maxPrice ?? undefined,
        disabled: refinedPriceSearchFilter == null && !isSelected,
      };
    }

    if (facet.__typename === 'OtherSearchFilter' && (facet as any).freeShipping) {
      const refinedFreeShippingSearchFilter =
        refinedFacet?.__typename === 'OtherSearchFilter' && (refinedFacet as any).freeShipping
          ? refinedFacet
          : null;
      const isSelected = filters.isFreeShipping === true;

      return {
        type: 'toggle-group' as const,
        paramName: `shipping`,
        label: t('freeShippingLabel'),
        options: [
          {
            label: t('freeShippingLabel'),
            value: 'free_shipping',
            disabled: refinedFreeShippingSearchFilter == null && !isSelected,
          },
        ],
      };
    }

    if (facet.__typename === 'OtherSearchFilter' && (facet as any).isFeatured) {
      const refinedIsFeaturedSearchFilter =
        refinedFacet?.__typename === 'OtherSearchFilter' && (refinedFacet as any).isFeatured
          ? refinedFacet
          : null;
      const isSelected = filters.isFeatured === true;

      return {
        type: 'toggle-group' as const,
        paramName: `isFeatured`,
        label: t('isFeaturedLabel'),
        options: [
          {
            label: t('isFeaturedLabel'),
            value: 'on',
            disabled: refinedIsFeaturedSearchFilter == null && !isSelected,
          },
        ],
      };
    }

    if (facet.__typename === 'OtherSearchFilter' && (facet as any).isInStock) {
      const refinedIsInStockSearchFilter =
        refinedFacet?.__typename === 'OtherSearchFilter' && (refinedFacet as any).isInStock
          ? refinedFacet
          : null;
      const isSelected = filters.hideOutOfStock === true;

      return {
        type: 'toggle-group' as const,
        paramName: `stock`,
        label: t('inStockLabel'),
        options: [
          {
            label: t('inStockLabel'),
            value: 'in_stock',
            disabled: refinedIsInStockSearchFilter == null && !isSelected,
          },
        ],
      };
    }

    return null;
  });
};
