import { useFormatter } from 'next-intl';
import { string, z } from 'zod';

// CardProduct type moved to Product interface
// import { CardProduct } from '@/vibes/soul/primitives/product-card';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

const priceSchema = z.object({
  value: z.number(),
  currencyCode: z.string(),
});

const PricesSchema = z.object({
  price: priceSchema,
  basePrice: priceSchema.nullable(),
  retailPrice: priceSchema.nullable(),
  salePrice: priceSchema.nullable(),
  priceRange: z.object({
    min: priceSchema,
    max: priceSchema,
  }),
});

export const BcProductSchema = z.object({
  entityId: z.number(),
  name: z.string(),
  defaultImage: z.object({ altText: z.string(), url: string() }).nullable(),
  brand: z.object({ name: z.string(), path: z.string() }).nullable(),
  path: z.string(),
  prices: PricesSchema,
});

export type BcProductSchema = z.infer<typeof BcProductSchema>;
export type CardProduct = BcProductSchema;

export function useBcProductToVibesProduct(): (product: BcProductSchema) => CardProduct {
  const format = useFormatter();

  return (product: any): any => {
    const { entityId, name, defaultImage, brand, path, prices } = product;
    const price = pricesTransformer(prices, format);

    return {
      id: entityId.toString(),
      title: name,
      href: path,
      image: defaultImage ? { src: defaultImage.url, alt: defaultImage.altText } : undefined,
      price,
      subtitle: brand?.name,
    };
  };
}
