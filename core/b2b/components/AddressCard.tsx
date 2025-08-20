'use client';

import { useState } from 'react';
import { deleteAddress, setDefaultAddress } from '~/b2b/server-actions';

interface Address {
  entityId: number;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2?: string;
  city: string;
  stateOrProvince: string;
  countryCode: string;
  postalCode: string;
  phone?: string;
  // Note: addressType and isDefault may not be available in BigCommerce GraphQL schema
  addressType?: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onUpdate: () => void;
}

export function AddressCard({ address, onEdit, onUpdate }: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAddress(address.entityId);
      if (result.success) {
        onUpdate();
      } else {
        alert(`Error deleting address: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Error deleting address');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    try {
      const addressType = address.addressType || 'shipping';
      const result = await setDefaultAddress(address.entityId, addressType);
      if (result.success) {
        onUpdate();
      } else {
        alert(`Error setting default address: ${result.error}`);
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Error setting default address');
    } finally {
      setIsSettingDefault(false);
    }
  };

  const getAddressTypeLabel = () => {
    // Note: addressType may not be available in BigCommerce GraphQL schema
    if (address.addressType === 'billing') return 'Billing';
    return 'Address';
  };

  const getAddressTypeColor = () => {
    // Note: addressType may not be available in BigCommerce GraphQL schema
    if (address.addressType === 'billing') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAddressTypeColor()}`}>
            {getAddressTypeLabel()}
          </span>
          {/* Note: isDefault may not be available in BigCommerce GraphQL schema */}
          {address.isDefault && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Default
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            disabled={isDeleting || isSettingDefault}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
            disabled={isDeleting || isSettingDefault}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Address Content */}
      <div className="space-y-1">
        <div className="font-medium text-gray-900">
          {address.firstName} {address.lastName}
        </div>
        
        {address.company && (
          <div className="text-gray-600">{address.company}</div>
        )}
        
        <div className="text-gray-600">
          {address.address1}
        </div>
        
        {address.address2 && (
          <div className="text-gray-600">{address.address2}</div>
        )}
        
        <div className="text-gray-600">
          {address.city}, {address.stateOrProvince} {address.postalCode}
        </div>
        
        <div className="text-gray-600">
          {address.countryCode}
        </div>
        
        {address.phone && (
          <div className="text-gray-600">{address.phone}</div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        {/* Note: Set as default functionality may not be available in BigCommerce GraphQL schema */}
        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            disabled={isDeleting || isSettingDefault}
          >
            {isSettingDefault ? 'Setting...' : 'Set as Default'}
          </button>
        )}
      </div>
    </div>
  );
} 