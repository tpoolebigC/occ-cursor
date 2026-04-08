'use client';

import { useRouter } from 'next/navigation';
import { FlooringCalculator } from '@/vibes/soul/sections/product-detail/flooring-calculator';
import { FlooringConfig } from '@/vibes/soul/sections/product-detail/flooring-config';
import { addFlooringToCart } from '../_actions/add-to-cart-flooring';

interface FlooringCalculatorWrapperProps {
  config: FlooringConfig;
  channelId?: number;
}

export function FlooringCalculatorWrapper({ config, channelId }: FlooringCalculatorWrapperProps) {
  const router = useRouter();

  const handleAddToCartSqft = async (sqft: number) => {
    const result = await addFlooringToCart({
      mode: 'sqft',
      productId: config.productId,
      variantId: config.variantId,
      sqft,
      pricePerSqft: config.pricePerSqft,
      modifierOptionId: config.modifierOptionId,
      channelId,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to add to cart');
    }

    router.refresh();
  };

  const handleAddToCartBoxes = async (quantity: number) => {
    const result = await addFlooringToCart({
      mode: 'boxes',
      productId: config.productId,
      variantId: config.variantId,
      boxes: quantity,
      channelId,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to add to cart');
    }

    router.refresh();
  };

  return (
    <FlooringCalculator
      config={config}
      onAddToCartBoxes={handleAddToCartBoxes}
      onAddToCartSqft={handleAddToCartSqft}
    />
  );
}
