/**
 * Flooring configuration types and parser.
 * Shared between server and client components.
 */

export interface FlooringConfig {
  unitOfMeasure: string;
  unitLabel: string;
  pricePerSqft: number;
  boxCoverageSqft: number;
  boxPrice: number;
  minOrderSqft: number;
  productId: number;
  variantId: number;
  modifierOptionId: number;
  currencyCode?: string;
}

/**
 * Parse product custom fields into FlooringConfig.
 * Returns null if this product is not a flooring product (no unit_of_measure field).
 */
export function parseFlooringConfig(
  customFields: Array<{ name: string; value: string }>,
  productId: number,
  variantId: number,
  modifierOptionId: number,
  currencyCode?: string,
): FlooringConfig | null {
  const fieldMap = new Map(customFields.map((f) => [f.name, f.value]));

  const unitOfMeasure = fieldMap.get('unit_of_measure');
  if (!unitOfMeasure || unitOfMeasure !== 'sqft') return null;

  return {
    unitOfMeasure,
    unitLabel: fieldMap.get('unit_label') || 'Square Feet',
    pricePerSqft: parseFloat(fieldMap.get('price_per_sqft') || '0'),
    boxCoverageSqft: parseFloat(fieldMap.get('box_coverage_sqft') || '0'),
    boxPrice: parseFloat(fieldMap.get('box_price') || '0'),
    minOrderSqft: parseFloat(fieldMap.get('min_order_sqft') || '0'),
    productId,
    variantId,
    modifierOptionId,
    currencyCode,
  };
}
