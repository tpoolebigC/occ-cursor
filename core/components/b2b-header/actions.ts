'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

/**
 * Server actions for the B2B header company/address selectors.
 * 
 * These use the B2B REST API to fetch addresses and company hierarchy,
 * and a cookie-based approach to persist the selected address for checkout
 * pre-population.
 */

const B2B_ADDRESS_COOKIE = 'b2b-selected-address';

// ============================================================================
// Fetch company addresses from B2B REST API
// ============================================================================

export interface HeaderAddress {
  id: number | string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  stateCode?: string;
  zipCode: string;
  country: string;
  countryCode?: string;
  phone?: string;
  label?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface HeaderCompany {
  companyId: number | string;
  companyName: string;
}

export async function getB2BHeaderAddresses(): Promise<{
  addresses: HeaderAddress[];
  error: string | null;
}> {
  try {
    const { b2bRestClient } = await import('~/client/b2b-client');
    const result = await b2bRestClient.getAddresses();
    const addresses: HeaderAddress[] = ((result as any)?.data ?? []).map((a: any) => ({
      id: a.id,
      firstName: a.firstName || '',
      lastName: a.lastName || '',
      company: a.company || a.companyName || '',
      addressLine1: a.addressLine1 || a.address1 || '',
      addressLine2: a.addressLine2 || a.address2 || '',
      city: a.city || '',
      state: a.state || a.stateOrProvince || '',
      stateCode: a.stateCode || '',
      zipCode: a.zipCode || a.postalCode || '',
      country: a.country || '',
      countryCode: a.countryCode || '',
      phone: a.phoneNumber || a.phone || '',
      label: a.label || a.addressLabel || '',
      isDefaultShipping: !!a.isDefaultShipping,
      isDefaultBilling: !!a.isDefaultBilling,
    }));

    return { addresses, error: null };
  } catch (error) {
    console.error('[B2B Header] Error fetching addresses:', error);
    return { addresses: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getB2BHeaderCompanies(): Promise<{
  companies: HeaderCompany[];
  currentCompanyId?: string;
  error: string | null;
}> {
  try {
    const { b2bRestClient } = await import('~/client/b2b-client');
    const result = await b2bRestClient.getCompanies();
    const companies: HeaderCompany[] = ((result as any)?.data ?? []).map((c: any) => ({
      companyId: c.id || c.companyId,
      companyName: c.companyName || c.name || '',
    }));

    return { companies, error: null };
  } catch (error) {
    console.error('[B2B Header] Error fetching companies:', error);
    return { companies: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// Address selection persistence (cookie-based for checkout integration)
// ============================================================================

export async function setSelectedAddress(address: HeaderAddress): Promise<void> {
  const cookieStore = await cookies();
  
  const cookieAddress = {
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    company: address.company || '',
    address1: address.addressLine1 || '',
    address2: address.addressLine2 || '',
    city: address.city || '',
    stateOrProvince: address.state || address.stateCode || '',
    countryCode: address.countryCode || address.country || '',
    postalCode: address.zipCode || '',
    phone: address.phone || '',
  };

  cookieStore.set(B2B_ADDRESS_COOKIE, JSON.stringify(cookieAddress), {
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
  });
}

export async function clearSelectedAddress(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(B2B_ADDRESS_COOKIE, '', { path: '/', maxAge: 0 });
}

export async function getSelectedAddressFromCookie(): Promise<any | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(B2B_ADDRESS_COOKIE);

  if (!cookie?.value) return null;

  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

// ============================================================================
// Checkout shipping pre-population (ported from freshstart)
// ============================================================================

const B2BAddShippingConsignmentsMutation = graphql(`
  mutation B2BAddShippingConsignments($input: AddCheckoutShippingConsignmentsInput!) {
    checkout {
      addCheckoutShippingConsignments(input: $input) {
        checkout {
          entityId
          shippingConsignments {
            entityId
          }
        }
      }
    }
  }
`);

const B2BUpdateShippingConsignmentMutation = graphql(`
  mutation B2BUpdateShippingConsignment($input: UpdateCheckoutShippingConsignmentInput!) {
    checkout {
      updateCheckoutShippingConsignment(input: $input) {
        checkout {
          entityId
          shippingConsignments {
            entityId
          }
        }
      }
    }
  }
`);

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'US', 'united states of america': 'US', usa: 'US',
  canada: 'CA', 'united kingdom': 'GB', 'great britain': 'GB',
  australia: 'AU', germany: 'DE', france: 'FR', italy: 'IT',
  spain: 'ES', netherlands: 'NL', brazil: 'BR', mexico: 'MX',
  japan: 'JP', china: 'CN', india: 'IN', 'south korea': 'KR',
  singapore: 'SG', 'new zealand': 'NZ', ireland: 'IE',
  sweden: 'SE', norway: 'NO', denmark: 'DK', finland: 'FI',
  switzerland: 'CH', austria: 'AT', belgium: 'BE', portugal: 'PT',
  poland: 'PL', 'czech republic': 'CZ', israel: 'IL',
  'south africa': 'ZA', 'hong kong': 'HK', taiwan: 'TW',
  philippines: 'PH', thailand: 'TH', indonesia: 'ID',
  malaysia: 'MY', vietnam: 'VN', colombia: 'CO',
  argentina: 'AR', chile: 'CL', peru: 'PE',
};

function normalizeCountryCode(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return COUNTRY_NAME_TO_CODE[trimmed.toLowerCase()] || trimmed;
}

/**
 * Pre-populate checkout shipping address from the B2B header selector cookie.
 * Call this before redirecting to checkout.
 */
export async function setB2BShippingAddress(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const addressCookie = cookieStore.get(B2B_ADDRESS_COOKIE);

    if (!addressCookie?.value) return false;

    let address: any;
    try {
      address = JSON.parse(addressCookie.value);
    } catch {
      return false;
    }

    if (!address.countryCode) return false;

    const { getCartId } = await import('~/lib/cart');
    const cartId = await getCartId();
    if (!cartId) return false;

    // We need to fetch the cart/checkout to get line items and existing consignments
    const customerAccessToken = await getSessionCustomerAccessToken();

    const GET_CART_FOR_CONSIGNMENT = graphql(`
      query GetCartForConsignment($cartId: String!) {
        site {
          cart(entityId: $cartId) {
            lineItems {
              physicalItems { entityId quantity }
              digitalItems { entityId quantity }
            }
          }
          checkout(entityId: $cartId) {
            entityId
            shippingConsignments { entityId }
          }
        }
      }
    `);

    const cartResponse = await client.fetch({
      document: GET_CART_FOR_CONSIGNMENT,
      variables: { cartId },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const cart = cartResponse.data?.site?.cart;
    const checkout = cartResponse.data?.site?.checkout;

    if (!checkout?.entityId || !cart) return false;

    const lineItems = [
      ...(cart.lineItems.physicalItems ?? []),
      ...(cart.lineItems.digitalItems ?? []),
    ].map((item) => ({
      lineItemEntityId: item.entityId,
      quantity: item.quantity,
    }));

    if (lineItems.length === 0) return false;

    const normalizedCountry = normalizeCountryCode(address.countryCode);

    const addressInput = {
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      company: address.company || '',
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      stateOrProvince: address.stateOrProvince || '',
      countryCode: normalizedCountry,
      postalCode: address.postalCode || '',
      phone: address.phone || '',
      shouldSaveAddress: false,
    };

    const existingConsignment = checkout.shippingConsignments?.[0];

    if (existingConsignment?.entityId) {
      await client.fetch({
        document: B2BUpdateShippingConsignmentMutation,
        variables: {
          input: {
            checkoutEntityId: checkout.entityId,
            consignmentEntityId: existingConsignment.entityId,
            data: {
              consignment: { address: addressInput, lineItems },
            },
          },
        },
        customerAccessToken,
        fetchOptions: { cache: 'no-store' },
      });
    } else {
      await client.fetch({
        document: B2BAddShippingConsignmentsMutation,
        variables: {
          input: {
            checkoutEntityId: checkout.entityId,
            data: {
              consignments: [{ address: addressInput, lineItems }],
            },
          },
        },
        customerAccessToken,
        fetchOptions: { cache: 'no-store' },
      });
    }

    // Clear cookie after success
    cookieStore.set(B2B_ADDRESS_COOKIE, '', { maxAge: 0, path: '/' });

    return true;
  } catch (error) {
    console.error('[B2B Shipping] Failed to set shipping address:', error);
    return false;
  }
}
