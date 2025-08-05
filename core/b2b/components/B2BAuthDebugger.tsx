'use client';

import { useState } from 'react';
import { useB2BAuth } from '../hooks/useB2BAuth';
import { CustomerRole, CompanyStatus } from '../utils/b2bAuthManager';

export function B2BAuthDebugger() {
  const auth = useB2BAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawState, setShowRawState] = useState(false);

  const getStatusColor = () => {
    if (auth.isLoading) return 'text-blue-600';
    if (auth.isAuthenticated) return 'text-green-600';
    if (auth.isInitialized) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (auth.isLoading) return 'Initializing...';
    if (auth.isAuthenticated) return 'Authenticated';
    if (auth.isInitialized) return 'Initialized (Not Authenticated)';
    return 'Not Initialized';
  };

  const getSourceBadgeColor = () => {
    switch (auth.source) {
      case 'B3Storage': return 'bg-green-100 text-green-800';
      case 'API': return 'bg-blue-100 text-blue-800';
      case 'Manual': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: CustomerRole): string => {
    switch (role) {
      case CustomerRole.B2C: return 'B2C Customer';
      case CustomerRole.ADMIN: return 'Company Admin';
      case CustomerRole.SENIOR_BUYER: return 'Senior Buyer';
      case CustomerRole.JUNIOR_BUYER: return 'Junior Buyer';
      case CustomerRole.CUSTOM_ROLE: return 'Custom Role';
      case CustomerRole.SUPER_ADMIN: return 'Super Admin';
      default: return 'Unknown Role';
    }
  };

  const getCompanyStatusName = (status: CompanyStatus): string => {
    switch (status) {
      case CompanyStatus.PENDING: return 'Pending';
      case CompanyStatus.APPROVED: return 'Approved';
      case CompanyStatus.REJECTED: return 'Rejected';
      case CompanyStatus.INACTIVE: return 'Inactive';
      case CompanyStatus.DELETED: return 'Deleted';
      case CompanyStatus.DEFAULT: return 'Default';
      default: return 'Unknown Status';
    }
  };

  const getCompanyStatusColor = (status: CompanyStatus): string => {
    switch (status) {
      case CompanyStatus.APPROVED: return 'text-green-600';
      case CompanyStatus.PENDING: return 'text-yellow-600';
      case CompanyStatus.REJECTED: return 'text-red-600';
      case CompanyStatus.INACTIVE: return 'text-gray-600';
      case CompanyStatus.DELETED: return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-indigo-800">B2B Authentication Manager</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => auth.reauthenticate()}
            disabled={auth.isLoading}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {auth.isLoading ? 'Loading...' : 'Re-authenticate'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            {isExpanded ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-indigo-800 mb-2">Authentication Status</h4>
          <div className="space-y-2 text-sm">
            <p className="text-indigo-700">
              <strong>Status:</strong> 
              <span className={`ml-2 ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </p>
            <p className="text-indigo-700">
              <strong>Source:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${getSourceBadgeColor()}`}>
                {auth.source}
              </span>
            </p>
            <p className="text-indigo-700">
              <strong>Initialized:</strong> {auth.isInitialized ? 'Yes' : 'No'}
            </p>
            <p className="text-indigo-700">
              <strong>Authenticated:</strong> {auth.isAuthenticated ? 'Yes' : 'No'}
            </p>
            <p className="text-indigo-700">
              <strong>B2B User:</strong> {auth.isB2BUser() ? 'Yes' : 'No'}
            </p>
            <p className="text-indigo-700">
              <strong>Masquerading:</strong> {auth.isMasquerading() ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-indigo-800 mb-2">User Context</h4>
          <div className="space-y-2 text-sm">
            {auth.userContext ? (
              <>
                <p className="text-indigo-700">
                  <strong>User ID:</strong> {auth.userContext.userId}
                </p>
                <p className="text-indigo-700">
                  <strong>Email:</strong> {auth.userContext.email || 'N/A'}
                </p>
                <p className="text-indigo-700">
                  <strong>Name:</strong> {auth.userContext.firstName} {auth.userContext.lastName}
                </p>
                <p className="text-indigo-700">
                  <strong>Role:</strong> {getRoleName(auth.userContext.role)} ({auth.userContext.role})
                </p>
                <p className="text-indigo-700">
                  <strong>User Type:</strong> {auth.userContext.userType}
                </p>
                <p className="text-indigo-700">
                  <strong>Company:</strong> {auth.userContext.companyName || 'N/A'}
                </p>
                <p className="text-indigo-700">
                  <strong>Company Status:</strong> 
                  <span className={`ml-1 ${getCompanyStatusColor(auth.userContext.companyStatus)}`}>
                    {getCompanyStatusName(auth.userContext.companyStatus)}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-indigo-700">No user context available</p>
            )}
          </div>
        </div>
      </div>

      {auth.error && (
        <div className="mt-4 p-3 bg-red-100 rounded border">
          <h4 className="font-semibold text-red-800 mb-1">Authentication Error</h4>
          <p className="text-red-700 text-sm">{auth.error}</p>
        </div>
      )}

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Company Information Section */}
          {auth.getCompanyInfo() && (
            <div className="p-3 bg-indigo-100 rounded border">
              <h4 className="font-semibold text-indigo-800 mb-2">Company Information</h4>
              <div className="text-sm text-indigo-700">
                <p><strong>Company ID:</strong> {auth.getCompanyInfo()?.id}</p>
                <p><strong>Company Name:</strong> {auth.getCompanyInfo()?.name}</p>
                <p><strong>Status:</strong> {getCompanyStatusName(auth.getCompanyInfo()?.status || CompanyStatus.DEFAULT)}</p>
                <p><strong>Customer Group ID:</strong> {auth.getCompanyInfo()?.customerGroupId || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Permissions Section */}
          {auth.getPermissions().length > 0 && (
            <div className="p-3 bg-indigo-100 rounded border">
              <h4 className="font-semibold text-indigo-800 mb-2">Permissions</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {auth.getPermissions().map((permission) => (
                  <div key={permission.code} className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${permission.permissionLevel > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-indigo-700">{permission.code}</span>
                    <span className="text-indigo-600">({permission.permissionLevel})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Masquerading Section */}
          {auth.isMasquerading() && auth.getMasqueradeCompany() && (
            <div className="p-3 bg-yellow-100 rounded border">
              <h4 className="font-semibold text-yellow-800 mb-2">Masquerading</h4>
              <div className="text-sm text-yellow-700">
                <p><strong>Masquerading Company:</strong> {auth.getMasqueradeCompany()?.companyName}</p>
                <p><strong>Company ID:</strong> {auth.getMasqueradeCompany()?.id}</p>
                <p><strong>Customer Group ID:</strong> {auth.getMasqueradeCompany()?.customerGroupId}</p>
              </div>
            </div>
          )}

          {/* Tokens Section */}
          {auth.userContext && (
            <div className="p-3 bg-indigo-100 rounded border">
              <h4 className="font-semibold text-indigo-800 mb-2">Authentication Tokens</h4>
              <div className="text-sm text-indigo-700">
                <p><strong>BC GraphQL Token:</strong> {auth.userContext.bcGraphqlToken ? 'Available' : 'Not available'}</p>
                <p><strong>B2B Token:</strong> {auth.userContext.b2bToken ? 'Available' : 'Not available'}</p>
                <p><strong>Customer JWT:</strong> {auth.userContext.currentCustomerJWT ? 'Available' : 'Not available'}</p>
              </div>
            </div>
          )}

          {/* Raw State Section */}
          <div className="p-3 bg-indigo-100 rounded border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-indigo-800">Raw Authentication State</h4>
              <button
                onClick={() => setShowRawState(!showRawState)}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                {showRawState ? 'Hide' : 'Show'} Raw Data
              </button>
            </div>
            {showRawState && (
              <pre className="text-xs text-indigo-700 overflow-auto max-h-48 bg-white p-2 rounded border">
                {JSON.stringify(auth, null, 2)}
              </pre>
            )}
          </div>

          {/* Actions Section */}
          <div className="p-3 bg-indigo-100 rounded border">
            <h4 className="font-semibold text-indigo-800 mb-2">Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => auth.initialize()}
                disabled={auth.isLoading}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                Initialize
              </button>
              <button
                onClick={() => auth.reauthenticate()}
                disabled={auth.isLoading}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                Re-authenticate
              </button>
              <button
                onClick={() => auth.logout()}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 