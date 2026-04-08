import { Number as NumberControl, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/features/makeswift/utils/runtime';
import { FlooringCalculatorMakeswift } from './flooring-calculator.client';

export const COMPONENT_TYPE = 'catalyst-flooring-calculator';

runtime.registerComponent(FlooringCalculatorMakeswift, {
  type: COMPONENT_TYPE,
  label: 'Flooring Calculator',
  props: {
    productId: NumberControl({
      label: 'Product ID',
      defaultValue: 0,
    }),
    variantId: NumberControl({
      label: 'Variant ID',
      defaultValue: 0,
    }),
    modifierOptionId: NumberControl({
      label: 'Modifier Option ID',
      defaultValue: 0,
    }),
    pricePerSqft: NumberControl({
      label: 'Price per Sqft',
      defaultValue: 5.99,
    }),
    boxCoverageSqft: NumberControl({
      label: 'Box Coverage (sqft)',
      defaultValue: 20,
    }),
    boxPrice: NumberControl({
      label: 'Box Price',
      defaultValue: 119.80,
    }),
    minOrderSqft: NumberControl({
      label: 'Minimum Order (sqft)',
      defaultValue: 10,
    }),
    unitLabel: TextInput({
      label: 'Unit Label',
      defaultValue: 'Square Feet',
    }),
    currencyCode: TextInput({
      label: 'Currency Code',
      defaultValue: 'USD',
    }),
  },
});
