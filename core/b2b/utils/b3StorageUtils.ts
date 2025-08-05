/**
 * B3Storage Utilities
 * 
 * These utilities work with the B3Storage object that BundleB2B stores in the browser's session storage.
 * This can provide direct access to B2B data without complex API authentication.
 */

export interface B3StorageData {
  B3B2BToken?: string;
  B3UserId?: number;
  B3CompanyId?: number;
  B3CompanyName?: string;
  B3CompanyInfo?: any;
  B3RoleId?: number;
  B3Email?: string;
  B3IsB2CUser?: boolean;
  B3CompanyStatus?: string;
  B3AppPermissions?: any;
  B3StorefrontConfig?: any;
  [key: string]: any;
}

/**
 * Get B3Storage data from the browser
 */
export function getB3Storage(): B3StorageData | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const b3Storage = (window as any).B3Storage;
    if (!b3Storage) return null;

    const data: B3StorageData = {};
    
    // Extract values from B3Storage objects
    Object.keys(b3Storage).forEach(key => {
      try {
        const value = b3Storage[key];
        if (value && typeof value === 'object' && 'value' in value) {
          data[key] = value.value;
        } else {
          data[key] = value;
        }
      } catch (err) {
        console.warn(`Error accessing B3Storage.${key}:`, err);
      }
    });

    return data;
  } catch (error) {
    console.error('Error getting B3Storage:', error);
    return null;
  }
}

/**
 * Check if B3Storage is available and has required data
 */
export function isB3StorageAvailable(): boolean {
  const data = getB3Storage();
  return !!(data && data.B3B2BToken && data.B3UserId);
}

/**
 * Get B2B authentication token from B3Storage
 */
export function getB2BToken(): string | null {
  const data = getB3Storage();
  return data?.B3B2BToken || null;
}

/**
 * Get B2B user ID from B3Storage
 */
export function getB2BUserId(): number | null {
  const data = getB3Storage();
  return data?.B3UserId || null;
}

/**
 * Get company information from B3Storage
 */
export function getCompanyInfo(): any {
  const data = getB3Storage();
  return data?.B3CompanyInfo || null;
}

/**
 * Get company name from B3Storage
 */
export function getCompanyName(): string | null {
  const data = getB3Storage();
  return data?.B3CompanyName || null;
}

/**
 * Check if user is a B2B user (not B2C)
 */
export function isB2BUser(): boolean {
  const data = getB3Storage();
  return data ? !data.B3IsB2CUser : false;
}

/**
 * Get user role information from B3Storage
 */
export function getUserRole(): { roleId?: number; permissions?: any } {
  const data = getB3Storage();
  return {
    roleId: data?.B3RoleId,
    permissions: data?.B3AppPermissions,
  };
}

/**
 * Wait for B3Storage to become available
 */
export function waitForB3Storage(timeoutMs: number = 10000): Promise<B3StorageData> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      const data = getB3Storage();
      
      if (data && data.B3B2BToken && data.B3UserId) {
        resolve(data);
        return;
      }
      
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error('B3Storage not available within timeout'));
        return;
      }
      
      setTimeout(check, 500);
    };
    
    check();
  });
}

/**
 * Get all available B3Storage data as a formatted object
 */
export function getAllB3StorageData(): B3StorageData | null {
  const data = getB3Storage();
  if (!data) return null;

  return {
    // Authentication
    B3B2BToken: data.B3B2BToken,
    B3UserId: data.B3UserId,
    
    // Company
    B3CompanyId: data.B3CompanyId,
    B3CompanyName: data.B3CompanyName,
    B3CompanyInfo: data.B3CompanyInfo,
    B3CompanyStatus: data.B3CompanyStatus,
    
    // User
    B3Email: data.B3Email,
    B3RoleId: data.B3RoleId,
    B3IsB2CUser: data.B3IsB2CUser,
    
    // Permissions & Config
    B3AppPermissions: data.B3AppPermissions,
    B3StorefrontConfig: data.B3StorefrontConfig,
    
    // Additional data
    B3AddressBook: data.B3AddressBook,
    B3QuoteCompany: data.B3QuoteCompany,
    B3SalesRepFirstIn: data.B3SalesRepFirstIn,
    B3isSetSalesRep: data.B3isSetSalesRep,
  };
} 