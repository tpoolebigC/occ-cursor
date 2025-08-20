/**
 * User Management Client
 * 
 * Catalyst-based user management using the official Catalyst client patterns.
 * Follows the patterns from https://www.catalyst.dev/docs/client
 */

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { CustomerRole } from '../components/UserManagement';

export interface B2BUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: CustomerRole;
  status: 'active' | 'inactive' | 'pending';
  companyId: number;
  companyName: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: CustomerRole;
  phone?: string;
  companyId: number;
  permissions?: string[];
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: CustomerRole;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  permissions?: string[];
}

export interface UserFilters {
  search?: string;
  role?: CustomerRole;
  status?: 'active' | 'inactive' | 'pending';
  companyId?: number;
  limit?: number;
  offset?: number;
}

// GraphQL queries following Catalyst patterns
const GET_CUSTOMER_INFO = graphql(`
  query GetCustomerInfo {
    customer {
      entityId
      email
      firstName
      lastName
      company
      customerGroupId
    }
  }
`);

const GET_COMPANY_USERS = graphql(`
  query GetCompanyUsers($companyId: Int!, $limit: Int, $offset: Int) {
    site {
      company(id: $companyId) {
        users(limit: $limit, offset: $offset) {
          edges {
            node {
              id
              email
              firstName
              lastName
              role
              status
              phone
              lastLogin
              createdAt
              permissions
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }
  }
`);

const CREATE_USER_MUTATION = graphql(`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        id
        email
        firstName
        lastName
        role
        status
        companyId
        companyName
        phone
        createdAt
        permissions
      }
      errors {
        message
        field
      }
    }
  }
`);

const UPDATE_USER_MUTATION = graphql(`
  mutation UpdateUser($userId: Int!, $input: UpdateUserInput!) {
    updateUser(userId: $userId, input: $input) {
      user {
        id
        email
        firstName
        lastName
        role
        status
        companyId
        companyName
        phone
        lastLogin
        createdAt
        permissions
      }
      errors {
        message
        field
      }
    }
  }
`);

const DELETE_USER_MUTATION = graphql(`
  mutation DeleteUser($userId: Int!) {
    deleteUser(userId: $userId) {
      success
      errors {
        message
        field
      }
    }
  }
`);

/**
 * Get customer information using Catalyst client
 */
export async function getCustomerInfo(customerAccessToken: string) {
  try {
    const response = await client.fetch({
      document: GET_CUSTOMER_INFO,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return response.data?.customer;
  } catch (error) {
    console.error('Error fetching customer info:', error);
    throw error;
  }
}

/**
 * Get users for a company using Catalyst client
 */
export async function getCompanyUsers(
  companyId: number, 
  customerAccessToken: string,
  filters: UserFilters = {}
): Promise<B2BUser[]> {
  try {
    const response = await client.fetch({
      document: GET_COMPANY_USERS,
      variables: {
        companyId,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    const users = response.data?.site?.company?.users?.edges || [];
    return users.map((edge: any) => edge.node);
  } catch (error) {
    console.error('Error fetching company users:', error);
    throw error;
  }
}

/**
 * Create a new user using Catalyst client
 */
export async function createUser(
  input: CreateUserInput,
  customerAccessToken: string
): Promise<B2BUser> {
  try {
    const response = await client.fetch({
      document: CREATE_USER_MUTATION,
      variables: { input },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    if (response.data?.createUser?.errors?.length > 0) {
      throw new Error(response.data.createUser.errors[0].message);
    }

    return response.data?.createUser?.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update an existing user using Catalyst client
 */
export async function updateUser(
  userId: number,
  input: UpdateUserInput,
  customerAccessToken: string
): Promise<B2BUser> {
  try {
    const response = await client.fetch({
      document: UPDATE_USER_MUTATION,
      variables: { userId, input },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    if (response.data?.updateUser?.errors?.length > 0) {
      throw new Error(response.data.updateUser.errors[0].message);
    }

    return response.data?.updateUser?.user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete a user using Catalyst client
 */
export async function deleteUser(
  userId: number,
  customerAccessToken: string
): Promise<boolean> {
  try {
    const response = await client.fetch({
      document: DELETE_USER_MUTATION,
      variables: { userId },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    if (response.data?.deleteUser?.errors?.length > 0) {
      throw new Error(response.data.deleteUser.errors[0].message);
    }

    return response.data?.deleteUser?.success || false;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Get user permissions using Catalyst client
 */
export async function getUserPermissions(
  userId: number,
  customerAccessToken: string
): Promise<string[]> {
  try {
    // This would need a specific GraphQL query for permissions
    // For now, we'll use a mock implementation
    const response = await client.fetch({
      document: graphql(`
        query GetUserPermissions($userId: Int!) {
          user(id: $userId) {
            permissions
          }
        }
      `),
      variables: { userId },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return response.data?.user?.permissions || [];
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

/**
 * Update user permissions using Catalyst client
 */
export async function updateUserPermissions(
  userId: number,
  permissions: string[],
  customerAccessToken: string
): Promise<string[]> {
  try {
    const response = await client.fetch({
      document: graphql(`
        mutation UpdateUserPermissions($userId: Int!, $permissions: [String!]!) {
          updateUserPermissions(userId: $userId, permissions: $permissions) {
            permissions
            errors {
              message
              field
            }
          }
        }
      `),
      variables: { userId, permissions },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    if (response.data?.updateUserPermissions?.errors?.length > 0) {
      throw new Error(response.data.updateUserPermissions.errors[0].message);
    }

    return response.data?.updateUserPermissions?.permissions || [];
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
}

/**
 * Invite user to company using Catalyst client
 */
export async function inviteUserToCompany(
  input: {
    email: string;
    firstName: string;
    lastName: string;
    role: CustomerRole;
    companyId: number;
    message?: string;
  },
  customerAccessToken: string
): Promise<B2BUser> {
  try {
    const response = await client.fetch({
      document: graphql(`
        mutation InviteUserToCompany($input: InviteUserInput!) {
          inviteUserToCompany(input: $input) {
            user {
              id
              email
              firstName
              lastName
              role
              status
              companyId
              companyName
              phone
              createdAt
              permissions
            }
            errors {
              message
              field
            }
          }
        }
      `),
      variables: { input },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    if (response.data?.inviteUserToCompany?.errors?.length > 0) {
      throw new Error(response.data.inviteUserToCompany.errors[0].message);
    }

    return response.data?.inviteUserToCompany?.user;
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
}

/**
 * Get available roles using Catalyst client
 */
export async function getAvailableRoles(customerAccessToken: string) {
  try {
    const response = await client.fetch({
      document: graphql(`
        query GetAvailableRoles {
          availableRoles {
            id
            name
            description
            permissions
          }
        }
      `),
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return response.data?.availableRoles || [];
  } catch (error) {
    console.error('Error fetching available roles:', error);
    return [];
  }
}

/**
 * Get user activity log using Catalyst client
 */
export async function getUserActivity(
  userId: number,
  customerAccessToken: string,
  limit: number = 50
) {
  try {
    const response = await client.fetch({
      document: graphql(`
        query GetUserActivity($userId: Int!, $limit: Int!) {
          userActivity(userId: $userId, limit: $limit) {
            id
            action
            timestamp
            details
            userId
          }
        }
      `),
      variables: { userId, limit },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return response.data?.userActivity || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
} 