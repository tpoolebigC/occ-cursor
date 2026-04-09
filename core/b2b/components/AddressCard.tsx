'use client';

import { useState } from 'react';
import { deleteAddress, setDefaultAddress } from '~/b2b/server-actions';

interface Address {
  id: number;
  label?: string;
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  countryCode: string;
  zipCode: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
  extraFields?: Array<{ fieldName: string; fieldValue: string }>;
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
      const result = await deleteAddress(address.id);
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
      const addressType = address.isDefaultBilling ? 'billing' : 'shipping';
      const result = await setDefaultAddress(address.id, addressType);
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

  const isDefault = address.isDefaultShipping || address.isDefaultBilling;

  const getAddressTypeLabel = () => {
    if (address.isDefaultBilling) return 'Billing';
    if (address.isDefaultShipping) return 'Shipping';
    return 'Address';
  };

  const getAddressTypeColor = () => {
    if (address.isDefaultBilling) return 'bg-blue-100 text-blue-800';
    return 'bg-primary-highlight text-primary';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAddressTypeColor()}`}>
            {getAddressTypeLabel()}
          </span>
          {isDefault && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Default
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-primary hover:text-primary-shadow text-sm font-medium"
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
          {address.addressLine1}
        </div>
        
        {address.addressLine2 && (
          <div className="text-gray-600">{address.addressLine2}</div>
        )}
        
        <div className="text-gray-600">
          {address.city}, {address.state} {address.zipCode}
        </div>
        
        <div className="text-gray-600">
          {address.country || address.countryCode}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex gap-3">
        {!address.isDefaultShipping && (
          <button
            onClick={() => {
              setIsSettingDefault(true);
              setDefaultAddress(address.id, 'shipping')
                .then((r) => r.success ? onUpdate() : alert(r.error))
                .finally(() => setIsSettingDefault(false));
            }}
            className="text-sm text-primary hover:text-primary-shadow font-medium"
            disabled={isDeleting || isSettingDefault}
          >
            {isSettingDefault ? 'Setting...' : 'Default Shipping'}
          </button>
        )}
        {!address.isDefaultBilling && (
          <button
            onClick={() => {
              setIsSettingDefault(true);
              setDefaultAddress(address.id, 'billing')
                .then((r) => r.success ? onUpdate() : alert(r.error))
                .finally(() => setIsSettingDefault(false));
            }}
            className="text-sm text-primary hover:text-primary-shadow font-medium"
            disabled={isDeleting || isSettingDefault}
          >
            {isSettingDefault ? 'Setting...' : 'Default Billing'}
          </button>
        )}
      </div>
    </div>
  );
} 