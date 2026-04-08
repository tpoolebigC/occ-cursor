/**
 * B2B GraphQL - Super Admin Masquerade Mutations
 *
 * Supports both Super Admin impersonation (begin/end masquerade)
 * and company-level switching (begin/end masquerading company).
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BSuperAdminCompany {
  companyId: number;
  companyName: string;
  companyStatus: number;
  extraFields: Array<{ fieldName: string; fieldValue: string }>;
}

export interface B2BSuperAdminCompanyEdge {
  node: B2BSuperAdminCompany;
}

export interface B2BSuperAdminCompaniesConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
  edges: B2BSuperAdminCompanyEdge[];
}

export interface B2BMasqueradeUserInfo {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: number;
  companyId: number;
  companyName: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const SUPER_ADMIN_COMPANIES_QUERY = `
  query SuperAdminCompanies(
    $first: Int = 50
    $offset: Int = 0
    $search: String
  ) {
    superAdminCompanies(first: $first, offset: $offset, search: $search) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage }
      edges {
        node {
          companyId
          companyName
          companyStatus
          extraFields {
            fieldName
            fieldValue
          }
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const SUPER_ADMIN_BEGIN_MASQUERADE_MUTATION = `
  mutation SuperAdminBeginMasquerade($companyId: Int!, $userId: Int) {
    superAdminBeginMasquerade(companyId: $companyId, userId: $userId) {
      userInfo {
        userId
        email
        firstName
        lastName
        role
        companyId
        companyName
      }
    }
  }
`;

const SUPER_ADMIN_END_MASQUERADE_MUTATION = `
  mutation SuperAdminEndMasquerade {
    superAdminEndMasquerade {
      message
    }
  }
`;

const USER_MASQUERADING_COMPANY_BEGIN_MUTATION = `
  mutation UserMasqueradingCompanyBegin($companyId: Int!) {
    userMasqueradingCompanyBegin(companyId: $companyId) {
      userInfo {
        userId
        email
        firstName
        lastName
        role
        companyId
        companyName
      }
    }
  }
`;

const USER_MASQUERADING_COMPANY_END_MUTATION = `
  mutation UserMasqueradingCompanyEnd {
    userMasqueradingCompanyEnd {
      message
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

/**
 * List companies available to the super admin / sales rep.
 */
export async function getSuperAdminCompanies(params?: {
  first?: number;
  offset?: number;
  search?: string;
}) {
  const data = await b2bGraphQL<{
    superAdminCompanies: B2BSuperAdminCompaniesConnection;
  }>(SUPER_ADMIN_COMPANIES_QUERY, {
    first: params?.first ?? 50,
    offset: params?.offset ?? 0,
    search: params?.search,
  });
  return data.superAdminCompanies;
}

/**
 * Begin masquerading as a user within a company (super admin only).
 */
export async function beginSuperAdminMasquerade(companyId: number, userId?: number) {
  const data = await b2bGraphQL<{
    superAdminBeginMasquerade: { userInfo: B2BMasqueradeUserInfo };
  }>(SUPER_ADMIN_BEGIN_MASQUERADE_MUTATION, { companyId, userId });
  return data.superAdminBeginMasquerade.userInfo;
}

/**
 * End super admin masquerade session.
 */
export async function endSuperAdminMasquerade() {
  const data = await b2bGraphQL<{
    superAdminEndMasquerade: { message: string };
  }>(SUPER_ADMIN_END_MASQUERADE_MUTATION);
  return data.superAdminEndMasquerade.message;
}

/**
 * Switch to a different company context (for users with multi-company access).
 */
export async function beginCompanyMasquerade(companyId: number) {
  const data = await b2bGraphQL<{
    userMasqueradingCompanyBegin: { userInfo: B2BMasqueradeUserInfo };
  }>(USER_MASQUERADING_COMPANY_BEGIN_MUTATION, { companyId });
  return data.userMasqueradingCompanyBegin.userInfo;
}

/**
 * End company masquerade and return to primary company.
 */
export async function endCompanyMasquerade() {
  const data = await b2bGraphQL<{
    userMasqueradingCompanyEnd: { message: string };
  }>(USER_MASQUERADING_COMPANY_END_MUTATION);
  return data.userMasqueradingCompanyEnd.message;
}
