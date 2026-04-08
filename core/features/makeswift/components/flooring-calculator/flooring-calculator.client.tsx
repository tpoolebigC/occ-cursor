'use client';

import { forwardRef, type Ref, useCallback, useState } from 'react';
import { FlooringCalculator } from '@/vibes/soul/sections/product-detail/flooring-calculator';
import { FlooringConfig } from '@/vibes/soul/sections/product-detail/flooring-config';

interface Props {
  productId?: number;
  variantId?: number;
  modifierOptionId?: number;
  pricePerSqft?: number;
  boxCoverageSqft?: number;
  boxPrice?: number;
  minOrderSqft?: number;
  unitLabel?: string;
  currencyCode?: string;
}

export const FlooringCalculatorMakeswift = forwardRef(
  (
    {
      productId = 0,
      variantId = 0,
      modifierOptionId = 0,
      pricePerSqft = 5.99,
      boxCoverageSqft = 20,
      boxPrice = 119.8,
      minOrderSqft = 10,
      unitLabel = 'Square Feet',
      currencyCode = 'USD',
    }: Props,
    ref: Ref<HTMLDivElement>,
  ) => {
    const [message, setMessage] = useState<string | null>(null);

    const config: FlooringConfig = {
      unitOfMeasure: 'sqft',
      unitLabel,
      pricePerSqft,
      boxCoverageSqft,
      boxPrice,
      minOrderSqft,
      productId,
      variantId,
      modifierOptionId,
      currencyCode,
    };

    const handleAddToCartSqft = useCallback(async (sqft: number) => {
      if (!productId) {
        setMessage('Configure a product ID in Makeswift to enable add to cart');
        return;
      }
      const { addFlooringToCart } = await import(
        '~/app/[locale]/(default)/product/[slug]/_actions/add-to-cart-flooring'
      );
      const result = await addFlooringToCart({
        mode: 'sqft',
        productId,
        variantId,
        sqft,
        pricePerSqft,
        modifierOptionId,
      });
      if (!result.success) throw new Error(result.error || 'Failed to add to cart');
      setMessage(`Added ${sqft} sqft to cart`);
      setTimeout(() => setMessage(null), 3000);
    }, [productId, variantId, pricePerSqft, modifierOptionId]);

    const handleAddToCartBoxes = useCallback(async (quantity: number) => {
      if (!productId) {
        setMessage('Configure a product ID in Makeswift to enable add to cart');
        return;
      }
      const { addFlooringToCart } = await import(
        '~/app/[locale]/(default)/product/[slug]/_actions/add-to-cart-flooring'
      );
      const result = await addFlooringToCart({
        mode: 'boxes',
        productId,
        variantId,
        boxes: quantity,
      });
      if (!result.success) throw new Error(result.error || 'Failed to add to cart');
      setMessage(`Added ${quantity} boxes to cart`);
      setTimeout(() => setMessage(null), 3000);
    }, [productId, variantId]);

    return (
      <div ref={ref}>
        <FlooringCalculator
          config={config}
          onAddToCartBoxes={handleAddToCartBoxes}
          onAddToCartSqft={handleAddToCartSqft}
        />
        {message && (
          <div className="mt-2 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
            {message}
          </div>
        )}
      </div>
    );
  },
);

FlooringCalculatorMakeswift.displayName = 'FlooringCalculatorMakeswift';
