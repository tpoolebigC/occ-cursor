/**
 * Quote Management Types
 * 
 * Type definitions for the B2B Quote Management system.
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

// Quote status enumeration
export enum QuoteStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

// Quote product interface
export interface QuoteProduct {
  id: number;
  productId: number;
  variantId?: number;
  name: string;
  sku: string;
  imageUrl?: string;
  quantity: number;
  basePrice: number;
  discountedPrice?: number;
  lineTotal: number;
  options?: QuoteProductOption[];
  isAvailable: boolean;
  isPurchasable: boolean;
  inventoryLevel?: number;
  maxQuantity?: number;
}

// Quote product option interface
export interface QuoteProductOption {
  id: number;
  name: string;
  value: string;
  price?: number;
}

// Quote address interface
export interface QuoteAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

// Quote information interface
export interface QuoteInfo {
  id?: number;
  title: string;
  referenceNumber?: string;
  status: QuoteStatus;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  
  // Contact information
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName?: string;
  
  // Addresses
  shippingAddress: QuoteAddress;
  billingAddress: QuoteAddress;
  useSameAddress: boolean;
  
  // Custom fields
  extraFields?: Record<string, any>;
  
  // Pricing
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
}

// Draft quote state interface
export interface DraftQuoteState {
  info: Partial<QuoteInfo>;
  products: QuoteProduct[];
  isSubmitting: boolean;
  submissionError?: string;
}

// Quote detail interface
export interface QuoteDetail extends QuoteInfo {
  products: QuoteProduct[];
  history?: QuoteHistoryItem[];
  permissions: QuotePermissions;
}

// Quote history item interface
export interface QuoteHistoryItem {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
}

// Quote permissions interface
export interface QuotePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canConvertToOrder: boolean;
  canExportPdf: boolean;
  canAddProducts: boolean;
  canModifyQuantities: boolean;
}

// Quote creation request interface
export interface CreateQuoteRequest {
  title: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName?: string;
  shippingAddress: QuoteAddress;
  billingAddress: QuoteAddress;
  useSameAddress: boolean;
  customerNotes?: string;
  extraFields?: Record<string, any>;
}

// Quote product addition request interface
export interface AddProductToQuoteRequest {
  productId: number;
  variantId?: number;
  quantity: number;
  options?: QuoteProductOption[];
}

// Quote checkout request interface
export interface QuoteCheckoutRequest {
  quoteId: number;
  createSession?: boolean;
}

// Quote checkout response interface
export interface QuoteCheckoutResponse {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

// Quote list filters interface
export interface QuoteListFilters {
  status?: QuoteStatus[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Quote list response interface
export interface QuoteListResponse {
  quotes: QuoteDetail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Quote table display interface
export interface QuoteTableDisplay {
  showImages: boolean;
  showSku: boolean;
  showOptions: boolean;
  showInventory: boolean;
  showPricing: boolean;
  showActions: boolean;
}

// Quote validation error interface
export interface QuoteValidationError {
  field: string;
  message: string;
  code?: string;
}

// Quote API response interface
export interface QuoteApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: QuoteValidationError[];
}

// Quote feature flags interface
export interface QuoteFeatureFlags {
  productQuoteEnabled: boolean;
  cartQuoteEnabled: boolean;
  bulkUploadEnabled: boolean;
  pdfExportEnabled: boolean;
  emailNotificationsEnabled: boolean;
  autoExpirationEnabled: boolean;
  maxProductsPerQuote?: number;
  maxQuoteValue?: number;
}

// Quote settings interface
export interface QuoteSettings {
  defaultExpirationDays: number;
  requireApproval: boolean;
  allowCustomerNotes: boolean;
  allowInternalNotes: boolean;
  taxInclusive: boolean;
  currency: string;
  decimalPlaces: number;
}

// Quote statistics interface
export interface QuoteStatistics {
  totalQuotes: number;
  draftQuotes: number;
  pendingQuotes: number;
  approvedQuotes: number;
  rejectedQuotes: number;
  convertedQuotes: number;
  totalValue: number;
  averageValue: number;
}

// Quote export options interface
export interface QuoteExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeProducts: boolean;
  includePricing: boolean;
  includeNotes: boolean;
  includeHistory: boolean;
}

// Quote notification interface
export interface QuoteNotification {
  id: number;
  type: 'created' | 'updated' | 'approved' | 'rejected' | 'expired' | 'converted';
  quoteId: number;
  quoteTitle: string;
  message: string;
  timestamp: string;
  isRead: boolean;
} 