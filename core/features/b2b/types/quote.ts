// B2B Quote Types
// Type definitions for B2B quote functionality

export interface QuoteConfigProps {
  key: string;
  value: string;
  extraFields: Record<string, string>;
}

export interface Quote {
  id: number;
  customerId: number;
  status: QuoteStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  items: QuoteItem[];
}

export interface QuoteItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: QuoteItemOption[];
}

export interface QuoteItemOption {
  optionId: number;
  optionName: string;
  value: string;
  priceModifier?: number;
}

export enum QuoteStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

export interface QuoteSearchParams {
  customerId?: number;
  status?: QuoteStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
} 