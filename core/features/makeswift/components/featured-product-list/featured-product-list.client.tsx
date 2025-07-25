'use client';

import { forwardRef, type Ref } from 'react';
import { Link } from '~/components/link';
import { useProducts } from '../../utils/use-products';

interface Props {
  title?: string;
  description?: string;
  maxProducts?: number;
  showPricing?: boolean;
  showRatings?: boolean;
  layout?: 'grid' | 'list' | 'masonry';
  columns?: string;
  ctaText?: string;
  ctaLink?: string;
  productGroup?: 'best-selling' | 'featured' | 'newest';
}

export const MakeswiftFeaturedProductList = forwardRef(
  ({ 
    title = 'Featured Products',
    description = 'Discover our handpicked selection of premium products.',
    maxProducts = 8,
    showPricing = true,
    showRatings = true,
    layout = 'grid',
    columns = '4',
    ctaText = 'View All Products',
    ctaLink = '/shop-all',
    productGroup = 'featured'
  }: Props, ref: Ref<HTMLDivElement>) => {
    const { products, isLoading } = useProducts({
      collection: productGroup,
      collectionLimit: maxProducts,
      additionalProductIds: [],
    });

    const gridCols = {
      '2': 'grid-cols-1 md:grid-cols-2',
      '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      '5': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    };

    if (isLoading || !products) {
      return (
        <div ref={ref} className="py-16" style={{ width: '100%' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
            </div>
            <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6 mb-8`}>
              {Array.from({ length: Math.min(maxProducts, 6) }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="py-16" style={{ width: '100%' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {products.length > 0 ? (
            <>
              <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6 mb-8`}>
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                    {product.image && (
                      <img 
                        src={product.image.src} 
                        alt={product.image.alt}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2">{product.title}</h3>
                    {product.subtitle && (
                      <p className="text-gray-600 text-sm mb-2">{product.subtitle}</p>
                    )}
                    {showPricing && product.price && (
                      <p className="text-green-600 font-bold mb-2">
                        {product.price}
                      </p>
                    )}
                    {showRatings && (
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400">★★★★☆</span>
                        <span className="text-gray-600 text-sm ml-1">(4.0)</span>
                      </div>
                    )}
                    <Link 
                      href={product.href}
                      className="w-full bg-[hsl(var(--primary))] text-white py-2 px-4 rounded-md hover:bg-[hsl(var(--primary)/0.9)] transition-colors text-center block"
                    >
                      View Product
                    </Link>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href={ctaLink}
                  className="inline-block bg-[hsl(var(--primary))] text-white px-8 py-3 rounded-md hover:bg-[hsl(var(--primary)/0.9)] transition-colors"
                >
                  {ctaText}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">No products found.</p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

MakeswiftFeaturedProductList.displayName = 'MakeswiftFeaturedProductList'; 