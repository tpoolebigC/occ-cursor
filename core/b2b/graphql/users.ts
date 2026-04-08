/**
 * B2B GraphQL - User Queries and Mutations
 *
 * User listing, email validation, CRUD, and role management.
 */

import { b2bGraphQL } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface B2BUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: number;
  companyRoleId: number;
  companyRoleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface B2BUserEdge {
  node: B2BUser;
}

export interface B2BUsersConnection {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean };
  edges: B2BUserEdge[];
}

export interface B2BUserEmailCheckResult {
  userType: string;
  userInfo: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
  } | null;
}

export interface B2BAuthRolePermission {
  permissionCode: string;
  permissionLevel: number;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const USER_FIELDS = `
  id
  email
  firstName
  lastName
  phone
  role
  companyRoleId
  companyRoleName
  createdAt
  updatedAt
`;

const USERS_QUERY = `
  query Users(
    $companyId: Int!
    $first: Int = 50
    $offset: Int = 0
    $search: String
    $role: Decimal
  ) {
    users(companyId: $companyId, first: $first, offset: $offset, search: $search, role: $role) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage }
      edges {
        node {
          ${USER_FIELDS}
        }
      }
    }
  }
`;

const USER_EMAIL_CHECK_QUERY = `
  query UserEmailCheck($email: String!) {
    userEmailCheck(email: $email) {
      userType
      userInfo {
        id
        email
        firstName
        lastName
        companyName
      }
    }
  }
`;

const CUSTOMER_EMAIL_CHECK_QUERY = `
  query CustomerEmailCheck($email: String!) {
    customerEmailCheck(email: $email) {
      userType
      userInfo {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

const AUTH_ROLE_PERMISSIONS_QUERY = `
  query AuthRolePermissions {
    authRolePermissions {
      permissionCode
      permissionLevel
    }
  }
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

const USER_CREATE_MUTATION = `
  mutation UserCreate($userData: UserInputType!) {
    userCreate(userData: $userData) {
      user {
        ${USER_FIELDS}
      }
    }
  }
`;

const USER_UPDATE_MUTATION = `
  mutation UserUpdate($id: Int!, $userData: UserUpdateInputType!) {
    userUpdate(id: $id, userData: $userData) {
      user {
        ${USER_FIELDS}
      }
    }
  }
`;

const USER_DELETE_MUTATION = `
  mutation UserDelete($id: Int!) {
    userDelete(id: $id) {
      message
    }
  }
`;

// ---------------------------------------------------------------------------
// Client functions
// ---------------------------------------------------------------------------

export async function getUsers(params: {
  companyId: number;
  first?: number;
  offset?: number;
  search?: string;
  role?: number;
}) {
  const data = await b2bGraphQL<{ users: B2BUsersConnection }>(USERS_QUERY, {
    companyId: params.companyId,
    first: params.first ?? 50,
    offset: params.offset ?? 0,
    search: params.search,
    role: params.role,
  });
  return data.users;
}

export async function checkUserEmail(email: string) {
  const data = await b2bGraphQL<{ userEmailCheck: B2BUserEmailCheckResult }>(
    USER_EMAIL_CHECK_QUERY,
    { email },
  );
  return data.userEmailCheck;
}

export async function checkCustomerEmail(email: string) {
  const data = await b2bGraphQL<{ customerEmailCheck: B2BUserEmailCheckResult }>(
    CUSTOMER_EMAIL_CHECK_QUERY,
    { email },
  );
  return data.customerEmailCheck;
}

export async function getAuthRolePermissions() {
  const data = await b2bGraphQL<{ authRolePermissions: B2BAuthRolePermission[] }>(
    AUTH_ROLE_PERMISSIONS_QUERY,
  );
  return data.authRolePermissions;
}

export async function createUser(userData: {
  companyId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: number;
  companyRoleId?: number;
}) {
  const data = await b2bGraphQL<{ userCreate: { user: B2BUser } }>(
    USER_CREATE_MUTATION,
    { userData },
  );
  return data.userCreate.user;
}

export async function updateUser(
  id: number,
  userData: Record<string, unknown>,
) {
  const data = await b2bGraphQL<{ userUpdate: { user: B2BUser } }>(
    USER_UPDATE_MUTATION,
    { id, userData },
  );
  return data.userUpdate.user;
}

export async function deleteUser(id: number) {
  const data = await b2bGraphQL<{ userDelete: { message: string } }>(
    USER_DELETE_MUTATION,
    { id },
  );
  return data.userDelete.message;
}
