/**
 * Order Management Types
 * 
 * Type definitions for the B2B Order Management system.
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

// Order status enumeration
export enum OrderStatus {
  PENDING = 'pending',
  AWAITING_FULFILLMENT = 'awaiting_fulfillment',
  AWAITING_SHIPMENT = 'awaiting_shipment',
  AWAITING_PICKUP = 'awaiting_pickup',
  PARTIALLY_SHIPPED = 'partially_shipped',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DECLINED = 'declined',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  MANUAL_VERIFICATION_REQUIRED = 'manual_verification_required',
  PENDING_APPROVAL = 'pending_approval',
}

// Order list item interface
export interface OrderListItem {
  orderId: number;
  firstName: string;
  lastName: string;
  poNumber?: string;
  money: {
    currency_token: string;
    decimal_places: number;
    decimal_token: string;
    thousands_token: string;
  };
  totalIncTax: number;
  totalExTax: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  companyName?: string;
  placedBy?: string;
  currencyCode: string;
  customerId: number;
}

// Order product item interface
export interface OrderProductItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price_inc_tax: number;
  price_ex_tax: number;
  total_inc_tax: number;
  total_ex_tax: number;
  product_options?: OrderProductOption[];
  image_url?: string;
  variant_id?: number;
  product_id: number;
}

// Order product option interface
export interface OrderProductOption {
  id: number;
  name: string;
  value: string;
  price?: number;
}

// Order address interface
export interface OrderAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
}

// Order shipment item interface
export interface OrderShipmentItem {
  id: number;
  tracking_number?: string;
  tracking_carrier?: string;
  items: OrderShipmentProduct[];
  shipping_address: OrderAddress;
  date_created: string;
  date_updated: string;
}

// Order shipment product interface
export interface OrderShipmentProduct {
  order_product_id: number;
  quantity: number;
}

// Order history event interface
export interface OrderHistoryEvent {
  id: number;
  order_id: number;
  customer_id: number;
  date_created: string;
  type: string;
  description: string;
  user_id?: number;
  user_name?: string;
}

// Comprehensive order data interface
export interface B2BOrderData {
  id: number;
  customer_id: number;
  date_created: string;
  date_modified: string;
  date_shipped?: string;
  status: OrderStatus;
  status_id: number;
  order_is_digital: boolean;
  
  // Customer information
  customer_message?: string;
  staff_notes?: string;
  
  // Financial information
  subtotal_inc_tax: number;
  subtotal_ex_tax: number;
  total_inc_tax: number;
  total_ex_tax: number;
  total_tax: number;
  currency_code: string;
  currency_exchange_rate: number;
  
  // Payment information
  payment_method: string;
  payment_provider_id?: string;
  payment_status: string;
  
  // Shipping information
  shipping_address: OrderAddress;
  billing_address: OrderAddress;
  shipments: OrderShipmentItem[];
  
  // Products
  products: OrderProductItem[];
  
  // History
  order_history: OrderHistoryEvent[];
  
  // B2B specific
  po_number?: string;
  company_name?: string;
  placed_by?: string;
  approval_status?: string;
  
  // Permissions
  permissions: OrderPermissions;
}

// Order permissions interface
export interface OrderPermissions {
  canReorder: boolean;
  canCreateShoppingList: boolean;
  canViewInvoice: boolean;
  canViewSubsidiaryOrders: boolean;
  canCancel: boolean;
  canRefund: boolean;
}

// Order list filters interface
export interface OrderListFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: OrderStatus[];
  placedBy?: string;
  company?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Order list response interface
export interface OrderListResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Order sort options
export type OrderSortField = 'id' | 'po_number' | 'total_inc_tax' | 'status' | 'placed_by' | 'date_created';
export type OrderSortDirection = 'asc' | 'desc';

export interface OrderSort {
  field: OrderSortField;
  direction: OrderSortDirection;
}

// Order API response interface
export interface OrderApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

// Reorder request interface
export interface ReorderRequest {
  orderId: number;
  productIds?: number[];
  addToCart?: boolean;
}

// Shopping list creation request interface
export interface CreateShoppingListFromOrderRequest {
  orderId: number;
  productIds?: number[];
  listName?: string;
}

// Order statistics interface
export interface OrderStatistics {
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: OrderListItem[];
} 