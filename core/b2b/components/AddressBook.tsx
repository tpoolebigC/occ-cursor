'use client';

import { useState } from 'react';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';

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
  addressType?: string;
  isDefault?: boolean;
}

interface AddressBookProps {
  addresses: Address[];
  onAddressUpdate: () => void;
}

export function AddressBook({ addresses, onAddressUpdate }: AddressBookProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleAddressSaved = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    onAddressUpdate();
  };

  // Note: addressType may not be available in BigCommerce GraphQL schema
  // For now, we'll show all addresses in a single list
  const allAddresses = addresses;
  const shippingAddresses = addresses.filter(addr => !addr.addressType || addr.addressType === 'shipping');
  const billingAddresses = addresses.filter(addr => addr.addressType === 'billing');

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Your Addresses</h2>
          <p className="text-sm text-gray-600">
            {addresses.length} address{addresses.length !== 1 ? 'es' : ''} total
          </p>
        </div>
        <button
          onClick={handleAddAddress}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Address
        </button>
      </div>

      {/* Address Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <AddressForm
                address={editingAddress}
                onSave={handleAddressSaved}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Address Lists */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Your Addresses
          <span className="ml-2 text-sm text-gray-500">
            ({allAddresses.length})
          </span>
        </h3>
        
        {allAddresses.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No addresses found</p>
            <button
              onClick={handleAddAddress}
              className="mt-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Add your first address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {allAddresses.map((address) => (
              <AddressCard
                key={address.entityId}
                address={address}
                onEdit={() => handleEditAddress(address)}
                onUpdate={onAddressUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 