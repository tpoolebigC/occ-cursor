// B2B Customer Service
// Service functions for B2B customer management

import { B2BSDK } from '../types/sdk';

/**
 * Get customer profile information
 */
export async function getCustomerProfile(sdk: B2BSDK, customerId: string) {
  try {
    if (!sdk.utils?.customer) {
      throw new Error('Customer service not available in B2B SDK');
    }
    const customer = await sdk.utils.customer.getCustomer(customerId);
    return customer;
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    throw error;
  }
}

/**
 * Update customer profile information
 */
export async function updateCustomerProfile(
  sdk: B2BSDK,
  customerId: string,
  profileData: any
) {
  try {
    if (!sdk.utils?.customer) {
      throw new Error('Customer service not available in B2B SDK');
    }
    const updatedCustomer = await sdk.utils.customer.updateCustomer(customerId, profileData);
    return updatedCustomer;
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
}

/**
 * Get customer company information
 */
export async function getCustomerCompany(sdk: B2BSDK, customerId: string) {
  try {
    if (!sdk.utils?.customer) {
      throw new Error('Customer service not available in B2B SDK');
    }
    const company = await sdk.utils.customer.getCompany(customerId);
    return company;
  } catch (error) {
    console.error('Error fetching customer company:', error);
    throw error;
  }
} 