/**
 * B2B GraphQL - Company Queries and Mutations
 *
 * Company info, roles, permissions, subsidiaries (hierarchy),
 * credit configuration, and payment terms.
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BCompanyPermission {
  code: string;
  name: string;
}

export interface B2BCompanyRolePermission {
  id: number;
  code: string;
  permissionLevel: number;
}

export interface B2BCompanyRole {
  id: number;
  name: string;
  roleType: number;
  roleLevel: number;
}

export interface B2BCompanyRoleEdge {
  node: B2BCompanyRole;
}

export interface B2BCompanyRolesConnection {
  totalCount: number;
  edges: B2BCompanyRoleEdge[];
}

export interface B2BCompanyCreditConfig {
  creditEnabled: boolean;
  creditCurrency: string;
  creditHold: boolean;
  availableCredit: string;
  limitPurchases: boolean;
}

export interface B2BCompanyPaymentTerms {
  termName: string;
  dueDays: number;
}

export interface B2BCompanySubsidiary {
  companyId: number;
  companyName: string;
  parentCompanyId: number;
  parentCompanyName: string;
  channelFlag: number;
}

export interface B2BCompanyExtraField {
  fieldName: string;
  fieldValue: string;
}

export interface B2BCompanyInfo {
  id: number;
  companyName: string;
  companyStatus: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  adminEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  extraFields: B2BCompanyExtraField[];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const CUSTOMER_INFO_QUERY = `
  query CustomerInfo {
    customerInfo {
      userType
      userInfo {
        id
        email
        firstName
        lastName
        role
        companyRoleId
        companyRoleName
        phoneNumber
      }
    }
  }
`;

const USER_COMPANY_QUERY = `
  query UserCompany($userId: Int!) {
    userCompany(userId: $userId) {
      id
      companyName
      companyStatus
      addressLine1
      addressLine2
      city
      state
      zipCode
      country
      extraFields {
        fieldName
        fieldValue
      }
    }
  }
`;

const COMPANY_ROLES_QUERY = `
  query CompanyRoles($first: Int = 50, $offset: Int = 0) {
    companyRoles(first: $first, offset: $offset) {
      totalCount
      edges {
        node {
          id
          name
          roleType
          roleLevel
        }
      }
    }
  }
`;

const COMPANY_PERMISSIONS_QUERY = `
  query CompanyPermissions {
    companyPermissions {
      code
      name
    }
  }
`;

const COMPANY_CREDIT_CONFIG_QUERY = `
  query CompanyCreditConfig {
    companyCreditConfig {
      creditEnabled
      creditCurrency
      creditHold
      availableCredit
      limitPurchases
    }
  }
`;

const COMPANY_PAYMENT_TERMS_QUERY = `
  query CompanyPaymentTerms {
    companyPaymentTerms {
      termName
      dueDays
    }
  }
`;

const COMPANY_SUBSIDIARIES_QUERY = `
  query CompanySubsidiaries {
    companySubsidiaries {
      companyId
      companyName
      parentCompanyId
      parentCompanyName
      channelFlag
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const COMPANY_CREATE_MUTATION = `
  mutation CompanyCreate($companyData: CompanyInputType!) {
    companyCreate(companyData: $companyData) {
      company {
        id
        companyName
        companyStatus
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

interface CustomerInfoResponse {
  customerInfo: {
    userType: number;
    userInfo: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: number;
      companyRoleId: number;
      companyRoleName: string;
      phoneNumber: string;
    };
  };
}

export async function getCustomerInfoFromB2B() {
  const data = await b2bGraphQL<CustomerInfoResponse>(CUSTOMER_INFO_QUERY);
  return data.customerInfo;
}

export async function getCompanyInfo() {
  const customerInfo = await getCustomerInfoFromB2B();
  const userId = customerInfo?.userInfo?.id;
  if (!userId) {
    throw new Error('Could not resolve B2B user ID from customerInfo');
  }
  const data = await b2bGraphQL<{ userCompany: B2BCompanyInfo }>(
    USER_COMPANY_QUERY,
    { userId },
  );
  return data.userCompany;
}

export async function getCompanyRoles(first = 50, offset = 0) {
  const data = await b2bGraphQL<{ companyRoles: B2BCompanyRolesConnection }>(
    COMPANY_ROLES_QUERY,
    { first, offset },
  );
  return data.companyRoles;
}

export async function getCompanyPermissions() {
  const data = await b2bGraphQL<{ companyPermissions: B2BCompanyPermission[] }>(
    COMPANY_PERMISSIONS_QUERY,
  );
  return data.companyPermissions;
}

export async function getCompanyCreditConfig() {
  const data = await b2bGraphQL<{ companyCreditConfig: B2BCompanyCreditConfig }>(
    COMPANY_CREDIT_CONFIG_QUERY,
  );
  return data.companyCreditConfig;
}

export async function getCompanyPaymentTerms() {
  const data = await b2bGraphQL<{ companyPaymentTerms: B2BCompanyPaymentTerms }>(
    COMPANY_PAYMENT_TERMS_QUERY,
  );
  return data.companyPaymentTerms;
}

export async function getCompanySubsidiaries() {
  const data = await b2bGraphQL<{ companySubsidiaries: B2BCompanySubsidiary[] }>(
    COMPANY_SUBSIDIARIES_QUERY,
  );
  return data.companySubsidiaries;
}

export async function createCompany(companyData: Record<string, unknown>) {
  const data = await b2bGraphQL<{
    companyCreate: { company: { id: number; companyName: string; companyStatus: number } };
  }>(COMPANY_CREATE_MUTATION, { companyData });
  return data.companyCreate.company;
}
