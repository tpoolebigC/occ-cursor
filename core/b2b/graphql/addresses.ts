/**
 * B2B GraphQL - Address Queries and Mutations
 *
 * Company addresses (with labels, extra fields, default flags) and
 * customer addresses (B2C). Includes country/state lookups.
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BAddressExtraField {
  fieldName: string;
  fieldValue: string;
}

export interface B2BAddress {
  id: number;
  label: string;
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
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  extraFields: B2BAddressExtraField[];
}

export interface B2BAddressEdge {
  node: B2BAddress;
}

export interface B2BAddressesConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
  edges: B2BAddressEdge[];
}

export interface B2BCustomerAddress {
  id: number;
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
}

export interface B2BCountry {
  countryName: string;
  countryCode: string;
  states: Array<{ stateName: string; stateCode: string }>;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const ADDRESS_FIELDS = `
  id
  label
  firstName
  lastName
  company
  addressLine1
  addressLine2
  city
  state
  zipCode
  country
  countryCode
  isDefaultShipping
  isDefaultBilling
  extraFields {
    fieldName
    fieldValue
  }
`;

const ADDRESSES_QUERY = `
  query Addresses(
    $companyId: Int!
    $first: Int = 50
    $offset: Int = 0
    $search: String
  ) {
    addresses(companyId: $companyId, first: $first, offset: $offset, search: $search) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage }
      edges {
        node {
          ${ADDRESS_FIELDS}
        }
      }
    }
  }
`;

const CUSTOMER_ADDRESSES_QUERY = `
  query CustomerAddresses($first: Int = 50, $offset: Int = 0) {
    customerAddresses(first: $first, offset: $offset) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage }
      edges {
        node {
          id
          firstName
          lastName
          company
          addressLine1
          addressLine2
          city
          state
          zipCode
          country
          countryCode
          phone
        }
      }
    }
  }
`;

const COUNTRIES_QUERY = `
  query Countries {
    countries {
      countryName
      countryCode
      states {
        stateName
        stateCode
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const ADDRESS_CREATE_MUTATION = `
  mutation AddressCreate($addressData: AddressInputType!) {
    addressCreate(addressData: $addressData) {
      address {
        ${ADDRESS_FIELDS}
      }
    }
  }
`;

const ADDRESS_UPDATE_MUTATION = `
  mutation AddressUpdate($id: Int!, $addressData: AddressUpdateType!) {
    addressUpdate(id: $id, addressData: $addressData) {
      address {
        ${ADDRESS_FIELDS}
      }
    }
  }
`;

const ADDRESS_DELETE_MUTATION = `
  mutation AddressDelete($id: Int!) {
    addressDelete(id: $id) {
      message
    }
  }
`;

const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation CustomerAddressCreate($addressData: AddressInputType!) {
    customerAddressCreate(addressData: $addressData) {
      address {
        id
        firstName
        lastName
        company
        addressLine1
        addressLine2
        city
        state
        zipCode
        country
        countryCode
        phone
      }
    }
  }
`;

const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
  mutation CustomerAddressUpdate($id: Int!, $addressData: CustomerAddressUpdateType!) {
    customerAddressUpdate(id: $id, addressData: $addressData) {
      address {
        id
        firstName
        lastName
        company
        addressLine1
        addressLine2
        city
        state
        zipCode
        country
        countryCode
        phone
      }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE_MUTATION = `
  mutation CustomerAddressDelete($id: Int!) {
    customerAddressDelete(id: $id) {
      message
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

export async function getCompanyAddresses(params: {
  companyId: number;
  first?: number;
  offset?: number;
  search?: string;
}) {
  const data = await b2bGraphQL<{ addresses: B2BAddressesConnection }>(
    ADDRESSES_QUERY,
    {
      companyId: params.companyId,
      first: params.first ?? 50,
      offset: params.offset ?? 0,
      search: params.search,
    },
  );
  return data.addresses;
}

export async function getCustomerAddresses(first = 50, offset = 0) {
  const data = await b2bGraphQL<{
    customerAddresses: {
      totalCount: number;
      pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
      edges: Array<{ node: B2BCustomerAddress }>;
    };
  }>(CUSTOMER_ADDRESSES_QUERY, { first, offset });
  return data.customerAddresses;
}

export async function getCountries() {
  const data = await b2bGraphQL<{ countries: B2BCountry[] }>(COUNTRIES_QUERY);
  return data.countries;
}

export async function createCompanyAddress(addressData: Record<string, unknown>) {
  const data = await b2bGraphQL<{
    addressCreate: { address: B2BAddress };
  }>(ADDRESS_CREATE_MUTATION, { addressData });
  return data.addressCreate.address;
}

export async function updateCompanyAddress(
  id: number,
  addressData: Record<string, unknown>,
) {
  const data = await b2bGraphQL<{
    addressUpdate: { address: B2BAddress };
  }>(ADDRESS_UPDATE_MUTATION, { id, addressData });
  return data.addressUpdate.address;
}

export async function deleteCompanyAddress(id: number) {
  const data = await b2bGraphQL<{ addressDelete: { message: string } }>(
    ADDRESS_DELETE_MUTATION,
    { id },
  );
  return data.addressDelete.message;
}

export async function createCustomerAddress(addressData: Record<string, unknown>) {
  const data = await b2bGraphQL<{
    customerAddressCreate: { address: B2BCustomerAddress };
  }>(CUSTOMER_ADDRESS_CREATE_MUTATION, { addressData });
  return data.customerAddressCreate.address;
}

export async function updateCustomerAddress(
  id: number,
  addressData: Record<string, unknown>,
) {
  const data = await b2bGraphQL<{
    customerAddressUpdate: { address: B2BCustomerAddress };
  }>(CUSTOMER_ADDRESS_UPDATE_MUTATION, { id, addressData });
  return data.customerAddressUpdate.address;
}

export async function deleteCustomerAddress(id: number) {
  const data = await b2bGraphQL<{ customerAddressDelete: { message: string } }>(
    CUSTOMER_ADDRESS_DELETE_MUTATION,
    { id },
  );
  return data.customerAddressDelete.message;
}
