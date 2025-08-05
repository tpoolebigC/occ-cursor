/**
 * Order API Services
 * 
 * API functions for the B2B Order Management system.
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use server';

import { 
  OrderListItem, 
  B2BOrderData, 
  OrderListResponse, 
  OrderListFilters, 
  OrderApiResponse,
  OrderSort,
  ReorderRequest,
  CreateShoppingListFromOrderRequest,
  OrderStatistics
} from '../types';
import { getB2BToken, getB2BUserId, getCompanyInfo } from '../../utils/b3StorageUtils';
import { b2bRestClient } from '../../server-actions';

// GraphQL queries for orders
const GET_ORDERS = `
  query GetOrders($first: Int!, $after: String, $filters: OrderFilters, $sort: OrderSort) {
    orders(first: $first, after: $after, filters: $filters, sort: $sort) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          customer_id
          date_created
          date_modified
          status
          status_id
          total_inc_tax
          total_ex_tax
          currency_code
          po_number
          company_name
          placed_by
          customer {
            first_name
            last_name
            email
          }
        }
      }
    }
  }
`;

const GET_ORDER_DETAIL = `
  query GetOrderDetail($id: ID!) {
    order(id: $id) {
      id
      customer_id
      date_created
      date_modified
      date_shipped
      status
      status_id
      order_is_digital
      customer_message
      staff_notes
      subtotal_inc_tax
      subtotal_ex_tax
      total_inc_tax
      total_ex_tax
      total_tax
      currency_code
      currency_exchange_rate
      payment_method
      payment_provider_id
      payment_status
      po_number
      company_name
      placed_by
      approval_status
      shipping_address {
        first_name
        last_name
        company
        address1
        address2
        city
        state
        postal_code
        country
        phone
        email
      }
      billing_address {
        first_name
        last_name
        company
        address1
        address2
        city
        state
        postal_code
        country
        phone
        email
      }
      products {
        id
        name
        sku
        quantity
        price_inc_tax
        price_ex_tax
        total_inc_tax
        total_ex_tax
        product_options {
          id
          name
          value
          price
        }
        image_url
        variant_id
        product_id
      }
      shipments {
        id
        tracking_number
        tracking_carrier
        date_created
        date_updated
        items {
          order_product_id
          quantity
        }
        shipping_address {
          first_name
          last_name
          company
          address1
          address2
          city
          state
          postal_code
          country
          phone
          email
        }
      }
      order_history {
        id
        order_id
        customer_id
        date_created
        type
        description
        user_id
        user_name
      }
      permissions {
        canReorder
        canCreateShoppingList
        canViewInvoice
        canViewSubsidiaryOrders
        canCancel
        canRefund
      }
    }
  }
`;

const REORDER_PRODUCTS = `
  mutation ReorderProducts($input: ReorderInput!) {
    reorderProducts(input: $input) {
      success
      cart_id
      errors {
        field
        message
        code
      }
    }
  }
`;

const CREATE_SHOPPING_LIST_FROM_ORDER = `
  mutation CreateShoppingListFromOrder($input: CreateShoppingListFromOrderInput!) {
    createShoppingListFromOrder(input: $input) {
      shopping_list {
        id
        name
        items {
          id
          product_id
          quantity
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

// Order API functions
export async function getOrders(
  filters: OrderListFilters = {}, 
  sort?: OrderSort
): Promise<OrderApiResponse<OrderListResponse>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const variables = {
      first: filters.limit || 20,
      after: filters.page ? btoa(`arrayconnection:${(filters.page - 1) * (filters.limit || 20)}`) : null,
      filters: {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        status: filters.status,
        placedBy: filters.placedBy,
        company: filters.company,
        search: filters.search,
      },
      sort: sort ? {
        field: sort.field,
        direction: sort.direction,
      } : null,
    };

    const response = await b2bRestClient.post('/graphql', {
      query: GET_ORDERS,
      variables,
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const orders = response.data?.data?.orders?.edges?.map((edge: any) => {
      const node = edge.node;
      return {
        orderId: node.id,
        firstName: node.customer?.first_name || '',
        lastName: node.customer?.last_name || '',
        poNumber: node.po_number,
        money: {
          currency_token: '$',
          decimal_places: 2,
          decimal_token: '.',
          thousands_token: ',',
        },
        totalIncTax: node.total_inc_tax,
        totalExTax: node.total_ex_tax,
        status: node.status,
        createdAt: node.date_created,
        updatedAt: node.date_modified,
        companyName: node.company_name,
        placedBy: node.placed_by,
        currencyCode: node.currency_code,
        customerId: node.customer_id,
      } as OrderListItem;
    }) || [];

    return {
      success: true,
      data: {
        orders,
        total: orders.length, // This would come from the API
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(orders.length / (filters.limit || 20)),
      }
    };

  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

export async function getOrderDetail(orderId: number): Promise<OrderApiResponse<B2BOrderData>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: GET_ORDER_DETAIL,
      variables: { id: orderId.toString() },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const order = response.data?.data?.order;
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, data: order };

  } catch (error) {
    console.error('Error fetching order detail:', error);
    return { success: false, error: 'Failed to fetch order detail' };
  }
}

export async function reorderProducts(request: ReorderRequest): Promise<OrderApiResponse<{ cartId: string }>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: REORDER_PRODUCTS,
      variables: { input: request },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.reorderProducts;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    return { success: true, data: { cartId: result.cart_id } };

  } catch (error) {
    console.error('Error reordering products:', error);
    return { success: false, error: 'Failed to reorder products' };
  }
}

export async function createShoppingListFromOrder(
  request: CreateShoppingListFromOrderRequest
): Promise<OrderApiResponse<{ shoppingListId: number }>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: CREATE_SHOPPING_LIST_FROM_ORDER,
      variables: { input: request },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.createShoppingListFromOrder;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    return { success: true, data: { shoppingListId: result.shopping_list.id } };

  } catch (error) {
    console.error('Error creating shopping list from order:', error);
    return { success: false, error: 'Failed to create shopping list' };
  }
}

export async function getOrderStatistics(): Promise<OrderApiResponse<OrderStatistics>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.get('/b2b/orders/statistics', {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
      }
    });

    return { success: true, data: response.data };

  } catch (error) {
    console.error('Error fetching order statistics:', error);
    return { success: false, error: 'Failed to fetch order statistics' };
  }
}

export async function cancelOrder(orderId: number, reason?: string): Promise<OrderApiResponse<B2BOrderData>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post(`/b2b/orders/${orderId}/cancel`, {
      reason,
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.error) {
      return { success: false, error: response.data.error };
    }

    return { success: true, data: response.data };

  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, error: 'Failed to cancel order' };
  }
}

export async function requestRefund(orderId: number, reason: string, items?: Array<{ productId: number, quantity: number }>): Promise<OrderApiResponse<{ refundId: number }>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post(`/b2b/orders/${orderId}/refund`, {
      reason,
      items,
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.error) {
      return { success: false, error: response.data.error };
    }

    return { success: true, data: { refundId: response.data.refund_id } };

  } catch (error) {
    console.error('Error requesting refund:', error);
    return { success: false, error: 'Failed to request refund' };
  }
} 