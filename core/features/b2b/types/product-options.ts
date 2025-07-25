// B2B Product Options Types
// Type definitions for B2B product option mapping

export interface B2BProductOption {
  optionEntityId: number;
  optionValueEntityId: number;
  entityId: number;
  valueEntityId: number;
  text: string;
  number: number;
  date: {
    utc: string;
  };
}

export interface B2BProductOptionValue {
  id: number;
  label: string;
  value: string;
  priceModifier?: number;
}

export interface B2BProductOptionField {
  id: number;
  name: string;
  type: string;
  required: boolean;
  options?: B2BProductOptionValue[];
} 