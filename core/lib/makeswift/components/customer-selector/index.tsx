'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

interface CustomerSelectorProps {
  className?: string;
  customerId?: string | null;
  placeholder?: string;
  showCompany?: boolean;
  showEmail?: boolean;
  allowSearch?: boolean;
  limit?: string;
  onCustomerChange?: (customerId: string) => void;
}

export function CustomerSelector({
  className = '',
  customerId,
  placeholder = 'Select a customer...',
  showCompany = true,
  showEmail = false,
  allowSearch = true,
  limit = '10',
  onCustomerChange,
}: CustomerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch customers when search query changes
  useEffect(() => {
    if (!allowSearch && searchQuery.length < 2) return;

    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/b2b/customers?search=${searchQuery}&limit=${parseInt(limit) || 10}`);
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allowSearch, limit]);

  // Set selected customer when customerId prop changes
  useEffect(() => {
    if (customerId && customers.length > 0) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [customerId, customers]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery('');
    setIsOpen(false);
    onCustomerChange?.(customer.id);
  };

  const getDisplayText = (customer: Customer) => {
    let text = `${customer.firstName} ${customer.lastName}`;
    if (showCompany && customer.company) {
      text += ` (${customer.company})`;
    }
    if (showEmail) {
      text += ` - ${customer.email}`;
    }
    return text;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Customer Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className={selectedCustomer ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCustomer ? getDisplayText(selectedCustomer) : placeholder}
        </span>
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search Input */}
          {allowSearch && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Customer List */}
          <div className="max-h-60 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-gray-500">Loading...</div>
            ) : customers.length > 0 ? (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                  {showCompany && customer.company && (
                    <div className="text-sm text-gray-600">{customer.company}</div>
                  )}
                  {showEmail && (
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">
                {searchQuery ? 'No customers found' : 'Start typing to search...'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 