// B2B Customer Types
// Type definitions for B2B customer management

export interface B2BProfile {
  role: B2BRole;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export enum B2BRole {
  GUEST = 'guest',
  B2C = 'b2c',
  B2B = 'b2b',
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  role: B2BRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSearchParams {
  query?: string;
  limit?: number;
  offset?: number;
  companyName?: string;
  isActive?: boolean;
} 