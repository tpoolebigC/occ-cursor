/**
 * B2B GraphQL - Invoice Queries and Mutations
 *
 * Full invoice lifecycle: listing, detail, PDF, export, payment via cart.
 * Previously required B2B REST Management API -- now entirely on GraphQL.
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BInvoiceBalance {
  value: string;
  code: string;
}

export interface B2BInvoiceExtraField {
  fieldName: string;
  fieldValue: string;
}

export interface B2BInvoiceCompanyInfo {
  companyId: number;
  companyName: string;
}

export interface B2BInvoiceCustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export interface B2BInvoice {
  id: string;
  invoiceNumber: string;
  type: string;
  dueDate: string;
  status: number;
  orderNumber: number;
  purchaseOrderNumber: string;
  originalBalance: B2BInvoiceBalance;
  openBalance: B2BInvoiceBalance;
  createdAt: string;
  updatedAt: string;
  channelId: number;
  pendingPaymentCount: number;
  externalId: string;
  externalCustomerId: string;
  companyInfo: B2BInvoiceCompanyInfo;
  customerInformation: B2BInvoiceCustomerInfo;
  extraFields: B2BInvoiceExtraField[];
  details: unknown;
}

export interface B2BInvoiceEdge {
  node: B2BInvoice;
}

export interface B2BInvoicesConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
  edges: B2BInvoiceEdge[];
}

export interface B2BInvoiceStats {
  totalBalance: string;
  overDueBalance: string;
  invoiceCount: number;
  overDueCount: number;
}

export interface B2BReceiptLine {
  id: string;
  invoiceId: string;
  amount: string;
  createdAt: string;
}

export interface B2BReceipt {
  id: string;
  receiptNumber: string;
  paymentMethod: string;
  amount: string;
  status: string;
  createdAt: string;
  lines: B2BReceiptLine[];
}

export interface B2BPaymentModule {
  moduleName: string;
  isEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const INVOICE_LIST_FIELDS = `
  id
  createdAt
  updatedAt
  storeHash
  customerId
  externalId
  invoiceNumber
  dueDate
  orderNumber
  purchaseOrderNumber
  notAllowedPay
  details
  status
  pendingPaymentCount
  openBalance {
    code
    value
  }
  originalBalance {
    code
    value
  }
  companyInfo {
    companyId
    companyName
  }
`;

const INVOICES_QUERY = `
  query Invoices(
    $first: Int = 25
    $offset: Int = 0
    $search: String
    $status: [String]
    $orderBy: String
  ) {
    invoices(
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
          ${INVOICE_LIST_FIELDS}
        }
      }
    }
  }
`;

const INVOICE_DETAIL_QUERY = `
  query InvoiceDetail($invoiceId: Int!) {
    invoice(invoiceId: $invoiceId) {
      ${INVOICE_LIST_FIELDS}
    }
  }
`;

const INVOICE_STATS_QUERY = `
  query InvoiceStats {
    invoiceStats {
      totalBalance
      overDueBalance
      invoiceCount
      overDueCount
    }
  }
`;

const PAYMENT_MODULES_QUERY = `
  query PaymentModules {
    paymentModules {
      moduleName
      isEnabled
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const INVOICE_PDF_MUTATION = `
  mutation InvoicePdf($invoiceId: Int!) {
    invoicePdf(invoiceId: $invoiceId) {
      url
    }
  }
`;

const INVOICES_EXPORT_MUTATION = `
  mutation InvoicesExport($filterData: InvoiceFilterDataType) {
    invoicesExport(filterData: $filterData) {
      url
    }
  }
`;

const CREATE_BC_CART_MUTATION = `
  mutation InvoiceCreateBcCart($bcCartData: BcCartInputType!) {
    invoiceCreateBcCart(bcCartData: $bcCartData) {
      cartId
      checkoutUrl
    }
  }
`;

const FINISH_BC_PAY_MUTATION = `
  mutation InvoiceFinishBcPayment($bcOrderId: Int!) {
    invoiceFinishBcPayment(bcOrderId: $bcOrderId) {
      message
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

export interface InvoiceListParams {
  first?: number;
  offset?: number;
  search?: string;
  status?: string[];
  orderBy?: string;
}

export async function getInvoices(params: InvoiceListParams = {}) {
  const data = await b2bGraphQL<{ invoices: B2BInvoicesConnection }>(INVOICES_QUERY, {
    first: params.first ?? 25,
    offset: params.offset ?? 0,
    search: params.search,
    status: params.status,
    orderBy: params.orderBy,
  });
  return data.invoices;
}

export async function getInvoiceDetail(invoiceId: number) {
  const data = await b2bGraphQL<{ invoice: B2BInvoice }>(INVOICE_DETAIL_QUERY, {
    invoiceId,
  });
  return data.invoice;
}

export async function getInvoiceStats() {
  const data = await b2bGraphQL<{ invoiceStats: B2BInvoiceStats }>(INVOICE_STATS_QUERY);
  return data.invoiceStats;
}

export async function getPaymentModules() {
  const data = await b2bGraphQL<{ paymentModules: B2BPaymentModule[] }>(
    PAYMENT_MODULES_QUERY,
  );
  return data.paymentModules;
}

export async function getInvoicePdf(invoiceId: number) {
  const data = await b2bGraphQL<{ invoicePdf: { url: string } }>(
    INVOICE_PDF_MUTATION,
    { invoiceId },
  );
  return data.invoicePdf.url;
}

export async function exportInvoices(filterData?: Record<string, unknown>) {
  const data = await b2bGraphQL<{ invoicesExport: { url: string } }>(
    INVOICES_EXPORT_MUTATION,
    { filterData },
  );
  return data.invoicesExport.url;
}

/**
 * Create a BigCommerce cart from invoice line items for payment processing.
 */
export async function createInvoicePaymentCart(bcCartData: Record<string, unknown>) {
  const data = await b2bGraphQL<{
    invoiceCreateBcCart: { cartId: string; checkoutUrl: string };
  }>(CREATE_BC_CART_MUTATION, { bcCartData });
  return data.invoiceCreateBcCart;
}

/**
 * Finalize a BigCommerce payment for an invoice.
 */
export async function finishInvoicePayment(bcOrderId: number) {
  const data = await b2bGraphQL<{ invoiceFinishBcPayment: { message: string } }>(
    FINISH_BC_PAY_MUTATION,
    { bcOrderId },
  );
  return data.invoiceFinishBcPayment.message;
}
