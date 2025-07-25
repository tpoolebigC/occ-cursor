// B2B Order Types
// Type definitions for B2B order functionality

export interface Order {
  id: number;
  customerId: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  billingAddress: Address;
  shippingAddress: Address;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: OrderItemOption[];
}

export interface OrderItemOption {
  optionId: number;
  optionName: string;
  value: string;
  priceModifier?: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  AWAITING_FULFILLMENT = 'awaiting_fulfillment',
  AWAITING_SHIPMENT = 'awaiting_shipment',
  AWAITING_PICKUP = 'awaiting_pickup',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  CANCELLED = 'cancelled',
  DECLINED = 'declined',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  MANUAL_VERIFICATION_REQUIRED = 'manual_verification_required',
  PENDING_APPROVAL = 'pending_approval',
}

export interface OrderSearchParams {
  customerId?: number;
  status?: OrderStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
} 