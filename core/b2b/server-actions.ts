'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

// B2B GraphQL API -- primary data source for all B2B operations.
// Single endpoint, single auth token, auto-scoped to user's company.
import {
  getAllOrders as gqlGetAllOrders,
  getCustomerOrders as gqlGetCustomerOrders,
  getOrderDetail as gqlGetOrderDetail,
  getCustomerOrderDetail as gqlGetCustomerOrderDetail,
  type B2BOrder,
  type B2BOrderProduct,
  type B2BOrderAddress,
  type OrderListParams,
} from './graphql/orders';

import {
  getQuotes as gqlGetQuotes,
  getCustomerQuotes as gqlGetCustomerQuotes,
  getQuoteDetail as gqlGetQuoteDetail,
  createQuote as gqlCreateQuote,
  updateQuote as gqlUpdateQuote,
  checkoutQuote as gqlCheckoutQuote,
  getQuotePdf as gqlGetQuotePdf,
  createQuoteAttachment as gqlCreateQuoteAttachment,
  deleteQuoteAttachment as gqlDeleteQuoteAttachment,
  emailQuote as gqlEmailQuote,
  type B2BQuote,
  type QuoteListParams,
} from './graphql/quotes';
import { B2BGraphQLError } from './graphql/client';

import {
  getInvoices as gqlGetInvoices,
  getInvoiceDetail as gqlGetInvoiceDetail,
  getInvoicePdf as gqlGetInvoicePdf,
  getInvoiceStats as gqlGetInvoiceStats,
  exportInvoices as gqlExportInvoices,
  createInvoicePaymentCart as gqlCreateInvoicePaymentCart,
  finishInvoicePayment as gqlFinishInvoicePayment,
  type B2BInvoice,
  type InvoiceListParams,
} from './graphql/invoices';

import {
  getShoppingLists as gqlGetShoppingLists,
  getShoppingListDetail as gqlGetShoppingListDetail,
  getCustomerShoppingLists as gqlGetCustomerShoppingLists,
  createShoppingList as gqlCreateShoppingList,
  updateShoppingList as gqlUpdateShoppingList,
  deleteShoppingList as gqlDeleteShoppingList,
  duplicateShoppingList as gqlDuplicateShoppingList,
  addItemsToShoppingList as gqlAddItems,
  updateShoppingListItems as gqlUpdateItems,
  deleteShoppingListItems as gqlDeleteItems,
  type B2BShoppingList,
} from './graphql/shopping-lists';

import {
  getCompanyAddresses as gqlGetCompanyAddresses,
  getCustomerAddresses as gqlGetCustomerAddresses,
  createCompanyAddress as gqlCreateCompanyAddress,
  updateCompanyAddress as gqlUpdateCompanyAddress,
  deleteCompanyAddress as gqlDeleteCompanyAddress,
  getCountries as gqlGetCountries,
  type B2BAddress,
} from './graphql/addresses';

import {
  getUsers as gqlGetUsers,
  createUser as gqlCreateUser,
  updateUser as gqlUpdateUser,
  deleteUser as gqlDeleteUser,
  checkUserEmail as gqlCheckUserEmail,
  getAuthRolePermissions as gqlGetAuthRolePermissions,
  type B2BUser,
} from './graphql/users';

import {
  getCompanyInfo as gqlGetCompanyInfo,
  getCompanyRoles as gqlGetCompanyRoles,
  getCompanySubsidiaries as gqlGetCompanySubsidiaries,
  getCompanyCreditConfig as gqlGetCompanyCreditConfig,
  getCompanyPaymentTerms as gqlGetCompanyPaymentTerms,
} from './graphql/company';

async function resolveCompanyId(): Promise<number> {
  const company = await gqlGetCompanyInfo();
  if (!company?.id) {
    throw new Error('Could not resolve company from B2B token');
  }
  return typeof company.id === 'string' ? parseInt(company.id as string, 10) : company.id;
}

// BC Storefront GraphQL client (for customer session, cart, product search)
import {
  getCustomerInfo as getCustomerInfoClient,
  getOrders as getStorefrontOrders,
  searchProducts as searchProductsClient,
  getCart as getCartClient,
  type CustomerInfo,
} from './client/b2b-graphql-client';

// ============================================================================
// CUSTOMER INFO (still uses BC Storefront GraphQL -- not a B2B API)
// ============================================================================

export async function getCustomerInfo() {
  try {
    const customer = await getCustomerInfoClient();
    return { customer, error: null };
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// ORDERS (B2B GraphQL API -- 1 call replaces 4 REST calls)
// ============================================================================

export type { B2BOrder, B2BOrderProduct, B2BOrderAddress } from './graphql/orders';

/** @deprecated Use B2BOrder instead. Kept for backward compatibility. */
export type EnrichedOrder = import('./graphql/orders').B2BOrder;

/**
 * Legacy compatibility wrapper. Used by CustomB2BDashboard and UnifiedB2BDashboard.
 * Calls the BC Storefront GraphQL for basic order data.
 */
export async function getOrders(first: number = 10, after?: string) {
  try {
    const orders = await getStorefrontOrders(first, after);
    return { customer: { orders }, error: null };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { customer: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getEnrichedOrders(params: {
  offset?: number;
  limit?: number;
  q?: string;
  status?: string;
  beginDateAt?: string;
  endDateAt?: string;
  orderBy?: string;
} = {}) {
  try {
    const result = await gqlGetAllOrders({
      first: params.limit ?? 25,
      offset: params.offset ?? 0,
      search: params.q,
      status: params.status,
      beginDateAt: params.beginDateAt,
      endDateAt: params.endDateAt,
      orderBy: params.orderBy,
    });

    const orders = result.edges.map((edge) => edge.node);

    return {
      orders,
      pagination: {
        totalCount: result.totalCount,
        offset: params.offset ?? 0,
        limit: params.limit ?? 25,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching orders via GraphQL:', error);
    return {
      orders: [],
      pagination: { totalCount: 0, offset: 0, limit: 25 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a single order with full detail.
 * Before: 4 REST calls (B2B order + V2 order + V2 products + V2 shipping)
 * After:  1 GraphQL call with everything.
 */
export async function getEnrichedOrder(bcOrderId: number) {
  try {
    const order = await gqlGetOrderDetail(bcOrderId);

    if (!order) {
      return { order: null, error: 'Order not found' };
    }

    return { order, error: null };
  } catch (error) {
    console.error('Error fetching order detail via GraphQL:', error);
    return { order: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get B2C customer orders (for non-company users).
 */
export async function getCustomerOrders(params: OrderListParams = {}) {
  try {
    const result = await gqlGetCustomerOrders(params);
    return {
      orders: result.edges.map((edge) => edge.node),
      pagination: {
        totalCount: result.totalCount,
        offset: params.offset ?? 0,
        limit: params.first ?? 25,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return {
      orders: [],
      pagination: { totalCount: 0, offset: 0, limit: 25 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// QUOTES (B2B GraphQL API -- full lifecycle)
// ============================================================================

export type { B2BQuote } from './graphql/quotes';

const QUOTE_STATUS_MAP: Record<number, string> = {
  0: 'New',
  2: 'In Process',
  3: 'Updated by Customer',
  4: 'Ordered',
  5: 'Expired',
  6: 'Archived',
  7: 'Draft',
};

export async function getQuotes(params: QuoteListParams = {}) {
  try {
    // Try company quotes first, fall back to customer quotes
    let result;
    try {
      result = await gqlGetQuotes(params);
    } catch {
      // Company-scoped query may fail if user is not a company admin — try customer quotes
      const { getCustomerQuotes: gqlGetCustomerQuotes } = await import('./graphql/quotes');
      result = await gqlGetCustomerQuotes(params);
    }

    const quotes = result.edges.map((edge) => ({
      ...edge.node,
      statusLabel: QUOTE_STATUS_MAP[edge.node.status] ?? `Status ${edge.node.status}`,
    }));

    return { quotes, error: null };
  } catch (error) {
    console.error('Error fetching quotes via GraphQL:', error);
    return { quotes: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getQuote(
  quoteId: number,
  opts?: { date?: string; storeHash?: string },
) {
  try {
    let detailOpts = opts;
    const dateProvided = detailOpts?.date?.trim();
    if (dateProvided) {
      // Date was supplied (from URL param) — use it directly
      const quote = await gqlGetQuoteDetail(quoteId, detailOpts);
      return { quote, error: null };
    }

    // No date provided — look up createdAt from the quotes list (with retry for eventual consistency)
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
      const listResult = await getQuotes({ first: 50, orderBy: '-created_at' });
      if (listResult.error) {
        return { quote: null, error: listResult.error };
      }
      const quotes = listResult.quotes ?? [];
      const found = quotes.find(
        (q: { id: number | string }) => String(q.id) === String(quoteId),
      );
      if (found && found.createdAt != null) {
        const quote = await gqlGetQuoteDetail(quoteId, {
          ...detailOpts,
          date: String(found.createdAt),
        });
        return { quote, error: null };
      }
      if (attempt < maxAttempts) {
        console.log(
          `[getQuote] Quote ${quoteId} not found in list (attempt ${attempt}/${maxAttempts}), retrying...`,
        );
      }
    }

    // Exhausted retries — try using the current timestamp as a last resort
    try {
      const nowTs = String(Math.floor(Date.now() / 1000));
      const quote = await gqlGetQuoteDetail(quoteId, { ...detailOpts, date: nowTs });
      return { quote, error: null };
    } catch {
      // Last resort failed too
    }

    return {
      quote: null,
      error: `Quote #${quoteId} could not be loaded. Try opening it from the Quotes list page.`,
    };
  } catch (error) {
    console.error('Error fetching quote detail:', error);
    return { quote: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * After creating a quote the mutation may not return createdAt.
 * The detail query requires the exact createdAt as its `date` param,
 * so we look it up from the quotes list (with retries for eventual consistency).
 * Mutates `quote` in place.
 */
async function resolveQuoteCreatedAt(quote: Record<string, unknown> | B2BQuote, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
    try {
      const listResult = await getQuotes({ first: 50, orderBy: '-created_at' });
      const found = (listResult.quotes ?? []).find(
        (q: { id: number | string }) => String(q.id) === String(quote.id),
      );
      if (found?.createdAt != null) {
        quote.createdAt = found.createdAt;
        return;
      }
    } catch {
      // ignore list errors; we'll just return without createdAt
    }
  }
}

export async function createQuote(input: Record<string, unknown>) {
  try {
    const result = await gqlCreateQuote(input);
    const quote = result.quote ?? {};

    if (quote.id && (quote.createdAt == null || quote.createdAt === 0)) {
      await resolveQuoteCreatedAt(quote);
    }

    return { quote, errors: [], error: null };
  } catch (error) {
    console.error('Error creating quote:', error);
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    const isGenericApiError =
      rawMessage === 'Bigcommerce API error.' || rawMessage === 'BigCommerce API error.';
    if (isGenericApiError) {
      const details =
        error instanceof B2BGraphQLError && error.errors?.length
          ? error.errors.map((e) => e.message).filter(Boolean).filter((m) => m !== rawMessage)
          : [];
      const detail = details.join('; ');
      return {
        quote: null,
        errors: [],
        error: detail
          ? `Quote creation failed: ${detail}`
          : 'Quote creation failed. Check that you’re logged in with a B2B account and the store has quotes enabled.',
      };
    }
    return { quote: null, errors: [], error: rawMessage };
  }
}

export interface QuoteLineItemInput {
  productId: number;
  variantId?: number;
  sku: string;
  productName: string;
  quantity: number;
  basePrice: number;
  offeredPrice: number;
  imageUrl?: string;
}

/** Create a new quote with the given line items. Fills contact/address/currency from session and env. */
export async function createQuoteWithProducts(lineItems: QuoteLineItemInput[], quoteTitle?: string) {
  try {
    const session = await auth();
    const storeHash = (process.env.BIGCOMMERCE_STORE_HASH ?? '').trim();
    if (!storeHash) {
      return {
        quote: null,
        errors: [],
        error: 'Store is not configured (BIGCOMMERCE_STORE_HASH is missing).',
      };
    }

    const customerName =
      [session?.user?.name?.split(' ')[0], session?.user?.name?.split(' ').slice(1).join(' ')]
        .filter(Boolean)
        .join(' ') || 'Customer';
    const customerEmail = (session?.user?.email as string)?.trim() || 'customer@example.com';

    const productList = lineItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? 0,
      sku: String(item.sku || '').trim() || String(item.productId),
      productName: String(item.productName || 'Product').trim(),
      quantity: Math.max(1, Number(item.quantity) || 1),
      basePrice: String(Number(item.basePrice) || 0),
      discount: '0',
      offeredPrice: String(Number(item.offeredPrice) || item.basePrice || 0),
      imageUrl: String(item.imageUrl ?? '').trim() || '',
      options: [],
    }));

    const subtotal = lineItems.reduce((sum, i) => sum + i.offeredPrice * i.quantity, 0);
    const discount = 0;
    const grandTotal = subtotal - discount;

    // Attempt to populate addresses from the user's address book
    let shippingAddress: Record<string, unknown> = {};
    let billingAddress: Record<string, unknown> = {};
    try {
      const addressResult = await getAddresses();
      if (addressResult.addresses?.length) {
        const defaultShipping = addressResult.addresses.find((a: any) => a.isDefaultShipping) || addressResult.addresses[0];
        const defaultBilling = addressResult.addresses.find((a: any) => a.isDefaultBilling) || defaultShipping;
        if (defaultShipping) {
          shippingAddress = {
            firstName: defaultShipping.firstName || '',
            lastName: defaultShipping.lastName || '',
            addressLine1: defaultShipping.addressLine1 || '',
            addressLine2: defaultShipping.addressLine2 || '',
            city: defaultShipping.city || '',
            state: defaultShipping.state || '',
            zipCode: defaultShipping.zipCode || '',
            country: defaultShipping.country || '',
          };
        }
        if (defaultBilling) {
          billingAddress = {
            firstName: defaultBilling.firstName || '',
            lastName: defaultBilling.lastName || '',
            addressLine1: defaultBilling.addressLine1 || '',
            addressLine2: defaultBilling.addressLine2 || '',
            city: defaultBilling.city || '',
            state: defaultBilling.state || '',
            zipCode: defaultBilling.zipCode || '',
            country: defaultBilling.country || '',
          };
        }
      }
    } catch {
      // Non-fatal — quote can be created without addresses
      console.log('[createQuoteWithProducts] Could not fetch addresses — proceeding without');
    }

    const quoteData = {
      quoteTitle: (quoteTitle ?? `Quote ${new Date().toLocaleDateString()}`).trim(),
      subtotal: String(subtotal),
      discount: String(discount),
      grandTotal: String(grandTotal),
      productList,
      shippingAddress,
      billingAddress,
      contactInfo: { name: customerName, email: customerEmail },
      currency: { currencyCode: 'USD' } as Record<string, unknown>,
      storeHash,
    };

    const result = await gqlCreateQuote(quoteData);
    const quote = result.quote ?? {};

    // The API may not populate createdAt on the mutation response.
    // We need the exact value for the detail query, so look it up from the list.
    if (quote.id && (quote.createdAt == null || quote.createdAt === 0)) {
      await resolveQuoteCreatedAt(quote);
    }

    return { quote, errors: [], error: null };
  } catch (error) {
    if (error instanceof B2BGraphQLError && error.errors?.length) {
      console.error('Error creating quote with products (API errors):', JSON.stringify(error.errors, null, 2));
    }
    console.error('Error creating quote with products:', error);
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    // Replace generic API message with something actionable
    const isGenericApiError =
      rawMessage === 'Bigcommerce API error.' || rawMessage === 'BigCommerce API error.';
    if (isGenericApiError) {
      const details =
        error instanceof B2BGraphQLError && error.errors?.length
          ? error.errors.map((e) => e.message).filter(Boolean).filter((m) => m !== rawMessage)
          : [];
      const detail = details.join('; ');
      return {
        quote: null,
        errors: [],
        error: detail
          ? `Quote creation failed: ${detail}`
          : 'Quote creation failed. Check that you’re logged in with a B2B account and the store has quotes enabled.',
      };
    }
    return { quote: null, errors: [], error: rawMessage };
  }
}

export async function updateQuote(quoteId: number, input: Record<string, unknown>) {
  try {
    const quote = await gqlUpdateQuote(quoteId, input);
    revalidatePath('/custom-dashboard/quotes');
    revalidatePath(`/custom-dashboard/quotes/${quoteId}`);
    return { quote, error: null };
  } catch (error) {
    console.error('Error updating quote:', error);
    return { quote: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function checkoutQuote(quoteId: number) {
  try {
    const result = await gqlCheckoutQuote(quoteId);
    return { ...result, error: null };
  } catch (error) {
    console.error('Error checking out quote:', error);
    return { cartId: null, cartUrl: null, checkoutUrl: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getQuotePdf(quoteId: number) {
  try {
    const url = await gqlGetQuotePdf(quoteId);
    return { url, error: null };
  } catch (error) {
    console.error('Error generating quote PDF:', error);
    return { url: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function emailQuote(quoteData: Record<string, unknown>) {
  try {
    const message = await gqlEmailQuote(quoteData);
    return { message, error: null };
  } catch (error) {
    console.error('Error emailing quote:', error);
    return { message: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// INVOICES (B2B GraphQL API -- previously REST-only)
// ============================================================================

export type { B2BInvoice } from './graphql/invoices';

export async function getB2BInvoices(params: InvoiceListParams = {}) {
  try {
    const result = await gqlGetInvoices(params);

    return {
      invoices: result.edges.map((edge) => edge.node),
      pagination: {
        totalCount: result.totalCount,
        offset: params.offset ?? 0,
        limit: params.first ?? 25,
      },
      error: null,
    };
  } catch (error: any) {
    if (error?.code === 404 || error?.message?.includes('404')) {
      return { invoices: [], pagination: { totalCount: 0, offset: 0, limit: 25 }, error: null };
    }
    console.error('Error fetching invoices via GraphQL:', error);
    return {
      invoices: [],
      pagination: { totalCount: 0, offset: 0, limit: 25 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getB2BInvoice(invoiceId: number | string) {
  try {
    const invoice = await gqlGetInvoiceDetail(typeof invoiceId === 'string' ? parseInt(invoiceId, 10) : invoiceId);
    return { invoice, error: null };
  } catch (error) {
    console.error('Error fetching invoice detail:', error);
    return { invoice: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getB2BInvoicePdf(invoiceId: number | string) {
  try {
    const url = await gqlGetInvoicePdf(typeof invoiceId === 'string' ? parseInt(invoiceId, 10) : invoiceId);
    return { url, error: null };
  } catch (error) {
    console.error('Error fetching invoice PDF:', error);
    return { url: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getB2BInvoiceStats() {
  try {
    const stats = await gqlGetInvoiceStats();
    return { stats, error: null };
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return { stats: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function exportB2BInvoices(filterData?: Record<string, unknown>) {
  try {
    const url = await gqlExportInvoices(filterData);
    return { url, error: null };
  } catch (error) {
    console.error('Error exporting invoices:', error);
    return { url: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// SHOPPING LISTS (B2B GraphQL API -- full CRUD + Duplicate)
// ============================================================================

export type { B2BShoppingList } from './graphql/shopping-lists';

export async function getShoppingLists(params?: { search?: string }) {
  try {
    const result = await gqlGetShoppingLists({ search: params?.search });
    return {
      shoppingLists: result.edges.map((edge) => edge.node),
      error: null,
    };
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return { shoppingLists: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getShoppingList(listId: number | string) {
  try {
    const raw = await gqlGetShoppingListDetail(Number(listId));
    const shoppingList = {
      ...raw,
      items: raw.products?.edges?.map((edge) => edge.node) ?? [],
    };
    return { shoppingList, error: null };
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return { shoppingList: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createShoppingList(input: { name: string; description?: string }) {
  try {
    const shoppingList = await gqlCreateShoppingList(input);
    revalidatePath('/custom-dashboard/shopping-lists');
    return { shoppingList, error: null };
  } catch (error) {
    console.error('Error creating shopping list:', error);
    return { shoppingList: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateShoppingList(listId: number | string, input: { name?: string; description?: string }) {
  try {
    const id = Number(listId);
    const shoppingList = await gqlUpdateShoppingList(id, input);
    revalidatePath('/custom-dashboard/shopping-lists');
    revalidatePath(`/custom-dashboard/shopping-lists/${id}`);
    return { shoppingList, error: null };
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return { shoppingList: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteShoppingList(listId: number | string) {
  try {
    await gqlDeleteShoppingList(Number(listId));
    revalidatePath('/custom-dashboard/shopping-lists');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function duplicateShoppingList(input: {
  sourceShoppingListId: number | string;
  name: string;
  description?: string;
}) {
  try {
    const shoppingList = await gqlDuplicateShoppingList({
      ...input,
      sourceShoppingListId: Number(input.sourceShoppingListId),
    });
    revalidatePath('/custom-dashboard/shopping-lists');
    return { shoppingList, error: null };
  } catch (error) {
    console.error('Error duplicating shopping list:', error);
    return { shoppingList: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addItemToShoppingList(
  listId: number | string,
  input: { productEntityId: number; variantId?: number; quantity: number },
) {
  try {
    const numericListId = Number(listId);
    const items = await gqlAddItems(numericListId, [{
      productId: Number(input.productEntityId),
      variantId: Number(input.variantId ?? 0),
      quantity: Number(input.quantity),
    }]);
    revalidatePath('/custom-dashboard/shopping-lists');
    revalidatePath(`/custom-dashboard/shopping-lists/${numericListId}`);
    return { item: items[0] ?? null, error: null };
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    return { item: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateShoppingListItem(
  listId: number | string,
  itemId: number | string,
  input: { quantity: number },
) {
  try {
    const id = Number(listId);
    const items = await gqlUpdateItems(id, [{ id: Number(itemId), quantity: Number(input.quantity) }]);
    revalidatePath(`/custom-dashboard/shopping-lists/${id}`);
    return { item: items[0] ?? null, error: null };
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    return { item: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function removeItemFromShoppingList(listId: number | string, itemId: number | string) {
  try {
    const id = Number(listId);
    await gqlDeleteItems(id, [Number(itemId)]);
    revalidatePath(`/custom-dashboard/shopping-lists/${id}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing item from shopping list:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// ADDRESSES (B2B GraphQL API -- company addresses with labels + defaults)
// ============================================================================

export type { B2BAddress } from './graphql/addresses';

export async function getAddresses() {
  try {
    const companyId = await resolveCompanyId();
    const result = await gqlGetCompanyAddresses({ companyId });
    return {
      addresses: result.edges.map((edge) => edge.node),
      error: null,
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return { addresses: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createAddress(addressData: Record<string, unknown>) {
  try {
    const address = await gqlCreateCompanyAddress(addressData);
    revalidatePath('/custom-dashboard/addresses');
    return { address, error: null };
  } catch (error) {
    console.error('Error creating address:', error);
    return { address: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateAddress(addressId: number, addressData: Record<string, unknown>) {
  try {
    const address = await gqlUpdateCompanyAddress(addressId, addressData);
    revalidatePath('/custom-dashboard/addresses');
    return { address, error: null };
  } catch (error) {
    console.error('Error updating address:', error);
    return { address: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteAddress(addressId: number) {
  try {
    await gqlDeleteCompanyAddress(addressId);
    revalidatePath('/custom-dashboard/addresses');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getCountries() {
  try {
    const countries = await gqlGetCountries();
    return { countries, error: null };
  } catch (error) {
    console.error('Error fetching countries:', error);
    return { countries: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// USER MANAGEMENT (B2B GraphQL API)
// ============================================================================

export type { B2BUser } from './graphql/users';

export async function getUsers(filters?: { search?: string; role?: number }) {
  try {
    const companyId = await resolveCompanyId();
    const result = await gqlGetUsers({
      companyId,
      search: filters?.search,
      role: filters?.role,
    });

    return {
      users: result.edges.map((edge) => edge.node),
      error: null,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: number;
  companyRoleId?: number;
}) {
  try {
    const companyId = await resolveCompanyId();
    const user = await gqlCreateUser({ ...input, companyId });
    revalidatePath('/custom-dashboard/users');
    return { user, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateUser(userId: number, input: Record<string, unknown>) {
  try {
    const user = await gqlUpdateUser(userId, input);
    revalidatePath('/custom-dashboard/users');
    return { user, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteUser(userId: number) {
  try {
    await gqlDeleteUser(userId);
    revalidatePath('/custom-dashboard/users');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function checkUserEmail(email: string) {
  try {
    const result = await gqlCheckUserEmail(email);
    return { result, error: null };
  } catch (error) {
    console.error('Error checking user email:', error);
    return { result: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getUserPermissions() {
  try {
    const permissions = await gqlGetAuthRolePermissions();
    return { permissions, error: null };
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return { permissions: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// COMPANY (B2B GraphQL API)
// ============================================================================

export async function getCompanyInfo() {
  try {
    const company = await gqlGetCompanyInfo();
    return { company, error: null };
  } catch (error) {
    console.error('Error fetching company info:', error);
    return { company: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getCompanyRoles() {
  try {
    const result = await gqlGetCompanyRoles();
    return { roles: result.edges.map((edge) => edge.node), error: null };
  } catch (error) {
    console.error('Error fetching company roles:', error);
    return { roles: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getCompanyHierarchy() {
  try {
    const subsidiaries = await gqlGetCompanySubsidiaries();
    return { subsidiaries, error: null };
  } catch (error) {
    console.error('Error fetching company hierarchy:', error);
    return { subsidiaries: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getCompanyCreditConfig() {
  try {
    const credit = await gqlGetCompanyCreditConfig();
    return { credit, error: null };
  } catch (error) {
    console.error('Error fetching company credit:', error);
    return { credit: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// CART (still uses BC Storefront GraphQL)
// ============================================================================

export async function getCart() {
  try {
    const cart = await getCartClient();
    return { cart, error: null };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { cart: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// PRODUCT SEARCH (uses configured search provider)
// ============================================================================

export interface AlgoliaProduct {
  objectID: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  productId: number;
  variantId?: number;
  description?: string;
}

/**
 * Search products using the configured search provider (BC native, Algolia, etc.)
 * Note: Function previously named searchAlgoliaProducts — renamed for V1 since
 * it uses the configured SEARCH_PROVIDER, not Algolia specifically.
 */
export async function searchProducts(query: string): Promise<AlgoliaProduct[]> {
  if (!query.trim()) return [];

  try {
    const { quickSearch } = await import('~/lib/search/search-actions');
    const results = await quickSearch(query, 10);

    return results.map((p) => ({
      objectID: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      salePrice: p.salePrice,
      imageUrl: p.imageUrl,
      variantId: p.variantId,
      productId: p.productId,
      description: p.description || '',
    }));
  } catch (error) {
    console.error('[Quick Order] Search failed:', error);
    return [];
  }
}

// ============================================================================
// PDP ACTIONS (wrappers for product-level add-to-quote / add-to-shopping-list)
// ============================================================================

export async function addProductToQuote(input: {
  quoteId: number;
  productId: number;
  variantId?: number;
  sku: string;
  productName: string;
  quantity: number;
  basePrice: number;
  offeredPrice: number;
  imageUrl?: string;
}) {
  try {
    await gqlUpdateQuote(input.quoteId, {
      productList: [{
        productId: input.productId,
        variantId: input.variantId ?? 0,
        sku: input.sku,
        basePrice: String(input.basePrice),
        offeredPrice: String(input.offeredPrice),
        quantity: input.quantity,
        imageUrl: input.imageUrl ?? '',
        productName: input.productName,
      }],
    });
    revalidatePath('/custom-dashboard/quotes');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding product to quote:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addProductToShoppingList(input: {
  listId: string | number;
  productId: number;
  variantId?: number;
  quantity: number;
}) {
  try {
    const result = await addItemToShoppingList(Number(input.listId), {
      productEntityId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
    });
    return { success: !result.error, error: result.error };
  } catch (error) {
    console.error('Error adding product to shopping list:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// ADDRESS DEFAULTS
// ============================================================================

export async function setDefaultAddress(addressId: number, addressType: string) {
  try {
    const updateData: Record<string, unknown> = {};
    if (addressType === 'billing') {
      updateData.isDefaultBilling = true;
    } else {
      updateData.isDefaultShipping = true;
    }
    await gqlUpdateCompanyAddress(addressId, updateData);
    revalidatePath('/custom-dashboard/addresses');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error setting default address:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
