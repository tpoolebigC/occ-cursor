/**
 * B2B User Management API Client
 * 
 * Handles all user management operations for BigCommerce B2B Edition
 * including user CRUD operations, role management, and permissions.
 */

import { auth } from '~/auth';
import { B2BRestClient } from '~/client/b2b-client';
import { CustomerRole } from '../utils/b2bAuthManager';

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

/**
 * Get all users for a company
 */
export async function getUsers(filters: UserFilters = {}): Promise<B2BUser[]> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    // Create B2B REST client
    const b2bClient = new B2BRestClient();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role !== undefined) params.append('role', filters.role.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.companyId) params.append('companyId', filters.companyId.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const endpoint = `/api/v3/io/users${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await b2bClient.request(endpoint) as any;
    
    // Transform response to match our interface
    return (response.data || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      companyName: user.companyName,
      phone: user.phone,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      permissions: user.permissions || []
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get a specific user by ID
 */
export async function getUser(userId: number): Promise<B2BUser | null> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    const response = await b2bClient.request(`/api/v3/io/users/${userId}`) as any;
    
    if (!response.data) {
      return null;
    }

    const user = response.data;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      companyName: user.companyName,
      phone: user.phone,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      permissions: user.permissions || []
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<B2BUser> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    const response = await b2bClient.request('/api/v3/io/users', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        phone: input.phone,
        companyId: input.companyId,
        permissions: input.permissions || []
      })
    }) as any;

    const user = response.data;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      companyName: user.companyName,
      phone: user.phone,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      permissions: user.permissions || []
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(userId: number, input: UpdateUserInput): Promise<B2BUser> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    const response = await b2bClient.request(`/api/v3/io/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    }) as any;

    const user = response.data;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      companyName: user.companyName,
      phone: user.phone,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      permissions: user.permissions || []
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: number): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    await b2bClient.request(`/api/v3/io/users/${userId}`, {
      method: 'DELETE'
    });

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Get user permissions
 */
export async function getUserPermissions(userId: number): Promise<string[]> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    const response = await b2bClient.request(`/api/v3/io/users/${userId}/permissions`) as any;
    
    return response.data?.permissions || [];
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error;
  }
}

/**
 * Update user permissions
 */
export async function updateUserPermissions(userId: number, permissions: string[]): Promise<string[]> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    const response = await b2bClient.request(`/api/v3/io/users/${userId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    }) as any;
    
    return response.data?.permissions || [];
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
}

/**
 * Get available roles
 */
export async function getAvailableRoles(): Promise<Array<{ id: number; name: string; description: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    const response = await b2bClient.request('/api/v3/io/roles') as any;
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
}

/**
 * Get company users (users in the same company)
 */
export async function getCompanyUsers(companyId: number): Promise<B2BUser[]> {
  return getUsers({ companyId });
}

/**
 * Invite user to company
 */
export async function inviteUserToCompany(input: {
  email: string;
  firstName: string;
  lastName: string;
  role: CustomerRole;
  companyId: number;
  message?: string;
}): Promise<B2BUser> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    const response = await b2bClient.request('/api/v3/io/users/invite', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        companyId: input.companyId,
        message: input.message
      })
    }) as any;

    const user = response.data;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: 'pending', // Invited users start as pending
      companyId: user.companyId,
      companyName: user.companyName,
      phone: user.phone,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      permissions: user.permissions || []
    };
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
}

/**
 * Resend invitation to user
 */
export async function resendInvitation(userId: number): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    await b2bClient.request(`/api/v3/io/users/${userId}/resend-invitation`, {
      method: 'POST'
    });

    return true;
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw error;
  }
}

/**
 * Activate/deactivate user
 */
export async function updateUserStatus(userId: number, status: 'active' | 'inactive'): Promise<B2BUser> {
  return updateUser(userId, { status });
}

/**
 * Get user activity log
 */
export async function getUserActivity(userId: number, limit: number = 50): Promise<Array<{
  id: number;
  action: string;
  timestamp: string;
  details: any;
}>> {
  try {
    const session = await auth();
    if (!session?.user?.customerAccessToken) {
      throw new Error('No customer access token available');
    }

    const b2bClient = new B2BRestClient();
    const response = await b2bClient.request(`/api/v3/io/users/${userId}/activity?limit=${limit}`) as any;
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
} 