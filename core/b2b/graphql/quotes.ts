/**
 * B2B GraphQL - Quote Queries and Mutations
 *
 * Full quote lifecycle: list, detail, create, update, checkout, order,
 * email, PDF export, file attachments.
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BQuoteProduct {
  productId: number;
  variantId: number;
  productName: string;
  sku: string;
  quantity: number;
  basePrice: string;
  offeredPrice: string;
  discount: string;
  imageUrl: string;
  options: Array<{ optionName: string; optionValue: string }>;
}

export interface B2BQuoteExtraField {
  fieldName: string;
  fieldValue: string;
}

export interface B2BQuoteAttachFile {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  createdAt: string;
}

export interface B2BSalesRepInfo {
  salesRepName: string;
  salesRepEmail: string;
}

export interface B2BQuoteTrackingItem {
  date: string;
  status: string;
  message: string;
  role: string;
}

export interface B2BQuoteCurrency {
  token: string;
  location: string;
  currencyCode: string;
  decimalToken: string;
  decimalPlaces: number;
  thousandsToken: string;
  currencyExchangeRate: string;
}

export interface B2BQuote {
  id: number;
  quoteNumber: string;
  quoteTitle: string;
  referenceNumber: string;
  status: number;
  createdAt: number;
  updatedAt: number;
  expiredAt: number;
  subtotal: string;
  discount: string;
  grandTotal: string;
  totalAmount: string;
  taxTotal: string;
  shippingTotal: string;
  currency: B2BQuoteCurrency | string;
  companyId: { id: string; companyName: string };
  channelId: number;
  channelName: string;
  salesRep: string;
  salesRepEmail: string;
  salesRepInfo: B2BSalesRepInfo;
  companyInfo: { companyId: string; companyName: string };
  storeInfo: { storeName: string; storeUrl: string; storeLogo: string };
  orderId: string;
  allowCheckout: boolean;
  displayDiscount: boolean;
  uuid: string;
  // Detail-only fields
  productsList?: B2BQuoteProduct[];
  storefrontAttachFiles?: B2BQuoteAttachFile[];
  backendAttachFiles?: B2BQuoteAttachFile[];
  trackingHistory?: unknown;
  shippingAddress?: Record<string, string>;
  billingAddress?: Record<string, string>;
  contactInfo?: unknown;
  notes?: string;
  legalTerms?: string;
  salesRepStatus: number;
  customerStatus: number;
}

export interface B2BQuoteEdge {
  node: B2BQuote;
}

export interface B2BQuotesConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
  edges: B2BQuoteEdge[];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const QUOTE_LIST_FIELDS = `
  id
  quoteNumber
  quoteTitle
  referenceNumber
  status
  createdAt
  updatedAt
  expiredAt
  subtotal
  discount
  grandTotal
  totalAmount
  taxTotal
  currency
  salesRep
  salesRepEmail
  orderId
  uuid
`;

const QUOTE_DETAIL_FIELDS = `
  id
  createdAt
  updatedAt
  quoteNumber
  quoteTitle
  referenceNumber
  userEmail
  bcCustomerId
  createdBy
  expiredAt
  companyId {
    id
    companyName
  }
  salesRepStatus
  customerStatus
  subtotal
  discount
  grandTotal
  cartId
  cartUrl
  checkoutUrl
  bcOrderId
  currency
  contactInfo
  trackingHistory
  notes
  legalTerms
  shippingTotal
  taxTotal
  totalAmount
  shippingMethod
  billingAddress
  shippingAddress
  discountType
  discountValue
  status
  company
  salesRep
  salesRepEmail
  orderId
  allowCheckout
  displayDiscount
  uuid
  channelId
  channelName
  productsList {
    productId
    sku
    basePrice
    discount
    offeredPrice
    quantity
    variantId
    imageUrl
    productName
    options
    notes
  }
  storefrontAttachFiles {
    id
    fileName
    fileType
    fileUrl
    createdBy
  }
  backendAttachFiles {
    id
    fileName
    fileType
    fileUrl
    createdBy
  }
  storeInfo {
    storeName
    storeAddress
    storeCountry
    storeLogo
    storeUrl
  }
  companyInfo {
    companyId
    companyName
    companyAddress
    companyCountry
    companyState
    companyCity
    companyZipCode
    phoneNumber
  }
  salesRepInfo {
    salesRepName
    salesRepEmail
    salesRepPhoneNumber
  }
`;

const QUOTES_QUERY = `
  query Quotes(
    $first: Int = 25
    $offset: Int = 0
    $search: String
    $status: Decimal
    $orderBy: String
  ) {
    quotes(
      first: $first
      offset: $offset
      search: $search
      status: $status
      orderBy: $orderBy
    ) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage }
      edges {
        node {
          ${QUOTE_LIST_FIELDS}
        }
      }
    }
  }
`;

const CUSTOMER_QUOTES_QUERY = `
  query CustomerQuotes(
    $first: Int = 25
    $offset: Int = 0
    $search: String
    $status: Decimal
  ) {
    customerQuotes(
      first: $first
      offset: $offset
      search: $search
      status: $status
    ) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage }
      edges {
        node {
          ${QUOTE_LIST_FIELDS}
        }
      }
    }
  }
`;

const QUOTE_DETAIL_QUERY = `
  query QuoteDetail($quoteId: Int!, $storeHash: String!, $date: String!) {
    quote(id: $quoteId, storeHash: $storeHash, date: $date) {
      ${QUOTE_DETAIL_FIELDS}
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const QUOTE_CREATE_MUTATION = `
  mutation QuoteCreate($quoteData: QuoteInputType!) {
    quoteCreate(quoteData: $quoteData) {
      quote {
        id
        createdAt
        uuid
      }
    }
  }
`;

const QUOTE_UPDATE_MUTATION = `
  mutation QuoteUpdate($quoteId: Int!, $quoteData: QuoteUpdateInputType!) {
    quoteUpdate(id: $quoteId, quoteData: $quoteData) {
      quote {
        trackingHistory
      }
    }
  }
`;

const QUOTE_CHECKOUT_MUTATION = `
  mutation QuoteCheckout($quoteId: Int!, $storeHash: String!) {
    quoteCheckout(id: $quoteId, storeHash: $storeHash) {
      quoteCheckout {
        cartId
        cartUrl
        checkoutUrl
      }
    }
  }
`;

const QUOTE_FRONTEND_PDF_MUTATION = `
  mutation QuoteFrontendPdf(
    $quoteId: Int!
    $storeHash: String!
    $currency: QuoteCurrencyInputType
  ) {
    quoteFrontendPdf(
      quoteId: $quoteId
      storeHash: $storeHash
      currency: $currency
    ) {
      url
    }
  }
`;

const QUOTE_ATTACHMENT_CREATE_MUTATION = `
  mutation QuoteAttachmentCreate($quoteId: Int!, $fileList: [QuoteFileListInputType]!) {
    quoteAttachFileCreate(quoteId: $quoteId, fileList: $fileList) {
      attachFiles {
        id
        fileName
        fileUrl
        fileSize
        fileType
        createdAt
      }
    }
  }
`;

const QUOTE_ATTACHMENT_DELETE_MUTATION = `
  mutation QuoteAttachmentDelete($quoteId: Int!, $fileId: Int!) {
    quoteAttachFileDelete(quoteId: $quoteId, fileId: $fileId) {
      message
    }
  }
`;

const QUOTE_EMAIL_MUTATION = `
  mutation QuoteEmail($quoteData: QuoteEmailInputType!) {
    quoteEmail(quoteData: $quoteData) {
      message
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

export interface QuoteListParams {
  first?: number;
  offset?: number;
  search?: string;
  status?: number;
  orderBy?: string;
}

export async function getQuotes(params: QuoteListParams = {}) {
  const data = await b2bGraphQL<{ quotes: B2BQuotesConnection }>(QUOTES_QUERY, {
    first: params.first ?? 25,
    offset: params.offset ?? 0,
    search: params.search,
    status: params.status,
    orderBy: params.orderBy,
  });
  return data.quotes;
}

export async function getCustomerQuotes(params: QuoteListParams = {}) {
  const data = await b2bGraphQL<{ customerQuotes: B2BQuotesConnection }>(
    CUSTOMER_QUOTES_QUERY,
    {
      first: params.first ?? 25,
      offset: params.offset ?? 0,
      search: params.search,
      status: params.status,
    },
  );
  return data.customerQuotes;
}

export async function getQuoteDetail(
  quoteId: number,
  opts?: { storeHash?: string; date?: string },
) {
  const storeHash = (opts?.storeHash ?? process.env.BIGCOMMERCE_STORE_HASH ?? '').trim();
  const date = (opts?.date ?? '').trim();
  if (!storeHash || !date) {
    throw new Error(
      'Quote detail requires storeHash and date (e.g. from quote list or create redirect). Open the quote from the list or use the link from after creating.',
    );
  }
  const data = await b2bGraphQL<{ quote: B2BQuote }>(QUOTE_DETAIL_QUERY, {
    quoteId,
    storeHash,
    date,
  });
  return data.quote;
}

export async function createQuote(quoteData: Record<string, unknown>) {
  const data = await b2bGraphQL<{
    quoteCreate: { quote: B2BQuote };
  }>(QUOTE_CREATE_MUTATION, { quoteData });
  return data.quoteCreate;
}

export async function updateQuote(quoteId: number, quoteData: Record<string, unknown>) {
  const data = await b2bGraphQL<{ quoteUpdate: { quote: B2BQuote } }>(
    QUOTE_UPDATE_MUTATION,
    { quoteId, quoteData },
  );
  return data.quoteUpdate.quote;
}

export async function checkoutQuote(quoteId: number) {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
  const data = await b2bGraphQL<{
    quoteCheckout: {
      quoteCheckout: { cartId: string; cartUrl: string; checkoutUrl: string };
    };
  }>(QUOTE_CHECKOUT_MUTATION, { quoteId, storeHash });
  return data.quoteCheckout.quoteCheckout;
}

export async function getQuotePdf(
  quoteId: number,
  currency?: { currencyCode: string; decimalPlaces: number },
) {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
  const data = await b2bGraphQL<{ quoteFrontendPdf: { url: string } }>(
    QUOTE_FRONTEND_PDF_MUTATION,
    { quoteId, storeHash, currency },
  );
  return data.quoteFrontendPdf.url;
}

export async function createQuoteAttachment(
  quoteId: number,
  files: Array<{ fileName: string; fileUrl: string; fileType?: string }>,
) {
  const data = await b2bGraphQL<{
    quoteAttachFileCreate: { attachFiles: B2BQuoteAttachFile[] };
  }>(QUOTE_ATTACHMENT_CREATE_MUTATION, { quoteId, fileList: files });
  return data.quoteAttachFileCreate.attachFiles;
}

export async function deleteQuoteAttachment(quoteId: number, fileId: number) {
  const data = await b2bGraphQL<{ quoteAttachFileDelete: { message: string } }>(
    QUOTE_ATTACHMENT_DELETE_MUTATION,
    { quoteId, fileId },
  );
  return data.quoteAttachFileDelete.message;
}

export async function emailQuote(quoteData: Record<string, unknown>) {
  const data = await b2bGraphQL<{ quoteEmail: { message: string } }>(
    QUOTE_EMAIL_MUTATION,
    { quoteData },
  );
  return data.quoteEmail.message;
}
