'use client';

import { type BcProductSchema } from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';
import { clsx } from 'clsx';

import { Carousel, CarouselButtons, CarouselContent, CarouselItem } from '../carousel';
import { ProductCard, mapBcProductToProduct } from '../product-card';

interface ProductsCarouselProps {
  products: BcProductSchema[];
  className?: string;
  hideOverflow?: boolean;
}

export function ProductsCarousel({ products, className, hideOverflow }: ProductsCarouselProps) {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: false,
      }}
      className={clsx('w-full', className)}
      hideOverflow={hideOverflow}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.entityId} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <ProductCard product={mapBcProductToProduct(product)} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselButtons />
    </Carousel>
  );
}

export function ProductsCarouselSkeleton({ className, hideOverflow }: { className?: string; hideOverflow?: boolean }) {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: false,
      }}
      className={clsx('w-full', className)}
      hideOverflow={hideOverflow}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CarouselItem key={i} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselButtons />
    </Carousel>
  );
} 