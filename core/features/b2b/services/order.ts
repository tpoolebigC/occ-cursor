// B2B Order Service
// Service functions for B2B order management

import { B2BSDK } from '../types/sdk';
import { Order, OrderItem, OrderSearchParams } from '../types/order';

/**
 * Get orders for a customer
 */
export async function getOrders(
  sdk: B2BSDK,
  customerId: string,
  params?: OrderSearchParams
): Promise<Order[]> {
  try {
    if (!sdk.utils?.order) {
      throw new Error('Order service not available in B2B SDK');
    }
    const orders = await sdk.utils.order.getOrders(customerId, params);
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Get a specific order by ID
 */
export async function getOrder(sdk: B2BSDK, orderId: string): Promise<Order> {
  try {
    if (!sdk.utils?.order) {
      throw new Error('Order service not available in B2B SDK');
    }
    const order = await sdk.utils.order.getOrder(orderId);
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Create a new order from a quote
 */
export async function createOrderFromQuote(
  sdk: B2BSDK,
  quoteId: string,
  orderData?: Partial<Order>
): Promise<Order> {
  try {
    if (!sdk.utils?.order) {
      throw new Error('Order service not available in B2B SDK');
    }
    const order = await sdk.utils.order.createFromQuote(quoteId, orderData);
    return order;
  } catch (error) {
    console.error('Error creating order from quote:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  sdk: B2BSDK,
  orderId: string,
  status: string
): Promise<Order> {
  try {
    if (!sdk.utils?.order) {
      throw new Error('Order service not available in B2B SDK');
    }
    const order = await sdk.utils.order.updateStatus(orderId, status);
    return order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Get order history for a customer
 */
export async function getOrderHistory(
  sdk: B2BSDK,
  customerId: string,
  limit?: number
): Promise<Order[]> {
  try {
    if (!sdk.utils?.order) {
      throw new Error('Order service not available in B2B SDK');
    }
    const orders = await sdk.utils.order.getHistory(customerId, limit);
    return orders;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
} 