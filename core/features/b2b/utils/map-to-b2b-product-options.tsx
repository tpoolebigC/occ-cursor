import { B2BProductOption } from '../types/product-options';

import { Field } from '~/vibes/soul/sections/product-detail/schema';

interface ProductOption {
  field: Field;
  value?: string | number;
}

/**
 * Maps product options to B2B format
 * Converts product field options to the format expected by the B2B API
 */
export function mapToB2BProductOptions({ field, value }: ProductOption): { optionId: number; value: string; } {
  const fieldId = Number(field.name);

  switch (field.type) {
    case 'text':
    case 'textarea':
      return {
        optionId: fieldId,
        value: String(value || ''),
      };

    case 'number':
      return {
        optionId: fieldId,
        value: String(value || 0),
      };

    case 'date':
      return {
        optionId: fieldId,
        value: value ? new Date(value).toISOString() : '',
      };

    case 'button-radio-group':
    case 'swatch-radio-group':
    case 'radio-group':
    case 'card-radio-group':
    case 'select': {
      const selectedOption = field.options.find((opt) => opt.value === String(value));

      return {
        optionId: fieldId,
        value: selectedOption?.value || String(value || ''),
      };
    }

    default:
      return {
        optionId: fieldId,
        value: String(value || ''),
      };
  }
} 