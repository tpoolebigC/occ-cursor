/**
 * B2B GraphQL - Order Queries and Mutations
 *
 * Replaces: B2B REST getOrders/getOrder + BC V2 getV2Order/getV2OrderProducts/getV2ShippingAddresses
 * Before: 4 REST calls per order detail
 * After:  1 GraphQL call with all data
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BOrderExtraInfo {
  extraStr1: string;
  extraStr2: string;
  extraStr3: string;
  extraStr4: string;
  extraStr5: string;
  extraInt1: number;
  extraInt2: number;
  extraInt3: number;
  extraInt4: number;
  extraInt5: number;
}

export interface B2BOrderProduct {
  productId: number;
  variantId: number;
  productName: string;
  sku: string;
  quantity: number;
  basePrice: string;
  discount: string;
  offeredPrice: string;
  orderProductId: number;
  imageUrl: string;
  options: Array<{ optionName: string; optionValue: string }>;
}

export interface B2BOrderAddress {
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  countryCode: string;
  phone: string;
  email: string;
}

export interface B2BOrderHistoryEvent {
  id: number;
  eventType: number;
  status: string;
  createdAt: number;
}

export interface B2BOrderCompanyInfo {
  companyId: string;
  companyName: string;
}

export interface B2BOrder {
  orderId: string;
  bcOrderId: number;
  totalIncTax: number;
  totalExTax: number;
  currencyCode: string;
  status: string;
  statusCode: number;
  customStatus: string;
  poNumber: string;
  referenceNumber: string;
  createdAt: number;
  updatedAt: number;
  channelId: number;
  channelName: string;
  money: string; // JSONString (auto-parsed)
  extraInfo: string; // JSONString
  extraStr1: string;
  extraStr2: string;
  extraStr3: string;
  extraInt1: number;
  extraInt2: number;
  extraInt3: number;
  companyName: string;
  companyInfo: B2BOrderCompanyInfo;
  // Detail-only fields (returned by single-order query)
  products?: B2BOrderProduct[];
  billingAddress?: B2BOrderAddress;
  shippingAddress?: B2BOrderAddress | B2BOrderAddress[];
  shipments?: unknown[];
  orderHistoryEvent?: B2BOrderHistoryEvent[];
  paymentMethod?: string;
  paymentStatus?: string;
  dateShipped?: string;
  customerMessage?: string;
  itemsTotal?: number;
  itemsShipped?: number;
  subtotalExTax?: number;
  shippingCostExTax?: number;
  discountAmount?: number;
}

export interface B2BOrderEdge {
  node: B2BOrder;
}

export interface B2BOrdersConnection {
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  edges: B2BOrderEdge[];
}

export interface AllOrdersData {
  allOrders: B2BOrdersConnection;
}

export interface CustomerOrdersData {
  customerOrders: B2BOrdersConnection;
}

export interface OrderDetailData {
  order: B2BOrder;
}

export interface CustomerOrderDetailData {
  customerOrder: B2BOrder;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const ORDER_FIELDS = `
  orderId
  bcOrderId
  totalIncTax
  currencyCode
  status
  statusCode
  customStatus
  poNumber
  referenceNumber
  createdAt
  updatedAt
  channelId
  channelName
  money
  extraInfo
  extraStr1
  extraStr2
  extraStr3
  extraInt1
  extraInt2
  extraInt3
  companyName
  companyInfo {
    companyId
    companyName
  }
`;

// BcOrderType fields (different from OrderType used in list queries)
const ORDER_DETAIL_FIELDS = `
  id
  companyName
  firstName
  lastName
  status
  statusId
  customStatus
  dateCreated
  dateModified
  dateShipped
  subtotalExTax
  subtotalIncTax
  totalExTax
  totalIncTax
  itemsTotal
  itemsShipped
  paymentMethod
  paymentStatus
  discountAmount
  currencyCode
  money
  customerMessage
  poNumber
  referenceNumber
  channelId
  shippingCostExTax
  shippingCostIncTax
  extraInfo
  extraStr1
  extraStr2
  extraStr3
  extraInt1
  extraInt2
  extraInt3
  products
  billingAddress
  shippingAddress
  shippingAddresses
  shipments
  orderHistoryEvent {
    id
    eventType
    status
    createdAt
  }
`;

const ALL_ORDERS_QUERY = `
  query AllOrders(
    $first: Int = 25
    $offset: Int = 0
    $search: String
    $status: String
    $beginDateAt: Date
    $endDateAt: Date
    $orderBy: String
  ) {
    allOrders(
      first: $first
      offset: $offset
      search: $search
      status: $status
      beginDateAt: $beginDateAt
      endDateAt: $endDateAt
      orderBy: $orderBy
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          ${ORDER_FIELDS}
        }
      }
    }
  }
`;

const CUSTOMER_ORDERS_QUERY = `
  query CustomerOrders(
    $first: Int = 25
    $offset: Int = 0
    $search: String
    $status: String
    $beginDateAt: Date
    $endDateAt: Date
  ) {
    customerOrders(
      first: $first
      offset: $offset
      search: $search
      status: $status
      beginDateAt: $beginDateAt
      endDateAt: $endDateAt
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          ${ORDER_FIELDS}
        }
      }
    }
  }
`;

const ORDER_DETAIL_QUERY = `
  query OrderDetail($orderId: Int!) {
    order(id: $orderId) {
      ${ORDER_DETAIL_FIELDS}
    }
  }
`;

const CUSTOMER_ORDER_DETAIL_QUERY = `
  query CustomerOrderDetail($orderId: Int!) {
    customerOrder(id: $orderId) {
      ${ORDER_DETAIL_FIELDS}
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

export interface OrderListParams {
  first?: number;
  offset?: number;
  search?: string;
  status?: string;
  beginDateAt?: string;
  endDateAt?: string;
  orderBy?: string;
}

/**
 * Fetch B2B company orders. Auto-scoped to the user's company via token.
 * No companyId resolution needed.
 */
export async function getAllOrders(params: OrderListParams = {}) {
  const data = await b2bGraphQL<AllOrdersData>(ALL_ORDERS_QUERY, {
    first: params.first ?? 25,
    offset: params.offset ?? 0,
    search: params.search,
    status: params.status,
    beginDateAt: params.beginDateAt,
    endDateAt: params.endDateAt,
    orderBy: params.orderBy,
  });

  return data.allOrders;
}

/**
 * Fetch orders for a B2C customer (non-company user).
 */
export async function getCustomerOrders(params: OrderListParams = {}) {
  const data = await b2bGraphQL<CustomerOrdersData>(CUSTOMER_ORDERS_QUERY, {
    first: params.first ?? 25,
    offset: params.offset ?? 0,
    search: params.search,
    status: params.status,
    beginDateAt: params.beginDateAt,
    endDateAt: params.endDateAt,
  });

  return data.customerOrders;
}

function normalizeAddress(raw: any): B2BOrderAddress | undefined {
  if (!raw) return undefined;
  return {
    firstName: raw.first_name ?? raw.firstName ?? '',
    lastName: raw.last_name ?? raw.lastName ?? '',
    company: raw.company ?? '',
    addressLine1: raw.street_1 ?? raw.addressLine1 ?? '',
    addressLine2: raw.street_2 ?? raw.addressLine2 ?? '',
    city: raw.city ?? '',
    state: raw.state ?? raw.stateOrProvince ?? '',
    zipCode: raw.zip ?? raw.zipCode ?? raw.postalCode ?? '',
    country: raw.country ?? '',
    countryCode: raw.country_iso2 ?? raw.countryCode ?? '',
    phone: raw.phone ?? '',
    email: raw.email ?? '',
  };
}

function normalizeProduct(raw: any): B2BOrderProduct {
  return {
    productId: raw.product_id ?? raw.productId ?? 0,
    variantId: raw.variant_id ?? raw.variantId ?? 0,
    productName: raw.name ?? raw.productName ?? '',
    sku: raw.sku ?? '',
    quantity: raw.quantity ?? 1,
    basePrice: raw.base_price ?? raw.price_inc_tax ?? raw.basePrice ?? '0',
    discount: raw.discount ?? '0',
    offeredPrice: raw.price_inc_tax ?? raw.offeredPrice ?? raw.base_price ?? '0',
    orderProductId: raw.id ?? raw.orderProductId ?? 0,
    imageUrl: raw.imageUrl ?? raw.image_url ?? '',
    options: (raw.product_options ?? raw.options ?? []).map((o: any) => ({
      optionName: o.display_name ?? o.optionName ?? '',
      optionValue: o.display_value ?? o.optionValue ?? '',
    })),
  };
}

function parseGenericScalar(val: unknown): any {
  if (val == null) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

/**
 * Bridge BcOrderType (detail query) fields to our unified B2BOrder interface.
 * BcOrderType uses BC V2-style names (id, statusId, dateCreated, etc.)
 * while OrderType (list query) uses B2B names (orderId, statusCode, createdAt, etc.).
 */
function normalizeOrderDetail(raw: any): B2BOrder {
  const parsedProducts = parseGenericScalar(raw.products);
  const products = Array.isArray(parsedProducts)
    ? parsedProducts.map(normalizeProduct)
    : [];

  const rawBilling = parseGenericScalar(raw.billingAddress);
  const rawShipping = parseGenericScalar(raw.shippingAddress);

  const billingAddress = normalizeAddress(rawBilling);
  const shippingAddress = Array.isArray(rawShipping)
    ? normalizeAddress(rawShipping[0])
    : normalizeAddress(rawShipping);

  const bcOrderId = typeof raw.id === 'string' ? parseInt(raw.id, 10) : Number(raw.id);

  let createdAt: number;
  if (raw.dateCreated) {
    const d = new Date(raw.dateCreated);
    createdAt = isNaN(d.getTime()) ? 0 : Math.floor(d.getTime() / 1000);
  } else {
    createdAt = 0;
  }

  let updatedAt: number;
  if (raw.dateModified || raw.updatedAt) {
    const d = new Date(raw.dateModified || raw.updatedAt);
    updatedAt = isNaN(d.getTime()) ? 0 : Math.floor(d.getTime() / 1000);
  } else {
    updatedAt = 0;
  }

  return {
    ...raw,
    orderId: String(bcOrderId),
    bcOrderId,
    statusCode: raw.statusId ?? 0,
    createdAt,
    updatedAt,
    channelName: '',
    totalIncTax: parseFloat(raw.totalIncTax) || 0,
    totalExTax: parseFloat(raw.totalExTax) || 0,
    subtotalExTax: parseFloat(raw.subtotalExTax) || 0,
    shippingCostExTax: parseFloat(raw.shippingCostExTax) || 0,
    discountAmount: parseFloat(raw.discountAmount) || 0,
    products,
    billingAddress,
    shippingAddress,
  };
}

/**
 * Fetch a single order with full detail (products, addresses, tracking).
 * The API returns products/billingAddress/shippingAddress as auto-parsed
 * JSONString with BC V2 field naming. We normalize to our typed interfaces.
 */
export async function getOrderDetail(orderId: number) {
  const data = await b2bGraphQL<OrderDetailData>(ORDER_DETAIL_QUERY, { orderId });
  return normalizeOrderDetail(data.order);
}

/**
 * Fetch a single B2C customer order with full detail.
 */
export async function getCustomerOrderDetail(orderId: number) {
  const data = await b2bGraphQL<CustomerOrderDetailData>(CUSTOMER_ORDER_DETAIL_QUERY, {
    orderId,
  });
  return normalizeOrderDetail(data.customerOrder);
}
