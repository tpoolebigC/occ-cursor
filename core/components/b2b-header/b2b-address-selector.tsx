'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { HeaderAddress } from './actions';

interface B2BAddressSelectorProps {
  /** Pre-fetched addresses from server component */
  initialAddresses?: HeaderAddress[];
  /** Called when user selects an address */
  onAddressSelect?: (address: HeaderAddress) => void;
}

const B2B_ADDRESS_COOKIE = 'b2b-selected-address';

function setAddressCookie(address: HeaderAddress): void {
  const cookieAddress = {
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    company: address.company || '',
    address1: address.addressLine1 || '',
    address2: address.addressLine2 || '',
    city: address.city || '',
    stateOrProvince: address.state || address.stateCode || '',
    countryCode: address.countryCode || address.country || '',
    postalCode: address.zipCode || '',
    phone: address.phone || '',
  };

  document.cookie = `${B2B_ADDRESS_COOKIE}=${encodeURIComponent(
    JSON.stringify(cookieAddress),
  )}; path=/; max-age=86400; SameSite=Lax`;
}

function clearAddressCookie(): void {
  document.cookie = `${B2B_ADDRESS_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function formatAddressLabel(address: HeaderAddress): string {
  if (address.label) return address.label;

  const parts: string[] = [];
  if (address.company) parts.push(address.company);
  if (address.addressLine1) parts.push(address.addressLine1);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);

  return parts.join(', ') || 'Unknown Address';
}

export function B2BAddressSelector({
  initialAddresses = [],
  onAddressSelect,
}: B2BAddressSelectorProps) {
  const [addresses, setAddresses] = useState<HeaderAddress[]>(initialAddresses);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState('Select Address');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialAddresses.length);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load addresses if not provided via props
  useEffect(() => {
    if (initialAddresses.length > 0) {
      setAddresses(initialAddresses);
      // Select default shipping address
      const defaultShipping = initialAddresses.find((a) => a.isDefaultShipping);
      if (defaultShipping) {
        setSelectedLabel(formatAddressLabel(defaultShipping));
        setSelectedId(defaultShipping.id);
        setAddressCookie(defaultShipping);
      }
      setIsLoading(false);
      return;
    }

    // Fetch addresses via server action
    async function fetchAddresses() {
      try {
        const { getB2BHeaderAddresses } = await import('./actions');
        const result = await getB2BHeaderAddresses();
        if (result.addresses.length > 0) {
          setAddresses(result.addresses);
          const defaultShipping = result.addresses.find((a) => a.isDefaultShipping);
          if (defaultShipping) {
            setSelectedLabel(formatAddressLabel(defaultShipping));
            setSelectedId(defaultShipping.id);
            setAddressCookie(defaultShipping);
          }
        }
      } catch {
        // Silently fail -- B2B API might not be available
      } finally {
        setIsLoading(false);
      }
    }

    fetchAddresses();
  }, [initialAddresses]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelectAddress = useCallback(
    (address: HeaderAddress) => {
      setIsOpen(false);
      setSelectedLabel(formatAddressLabel(address));
      setSelectedId(address.id);
      setAddressCookie(address);
      onAddressSelect?.(address);
    },
    [onAddressSelect],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Ship To
        </span>
        <div className="h-7 w-40 animate-pulse rounded border border-gray-200 bg-gray-100" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Ship To
        </span>
        <button
          className="flex items-center gap-1 rounded border border-gray-300 bg-transparent px-2.5 py-1 text-sm hover:border-gray-400 hover:bg-gray-50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="max-w-[250px] truncate">{selectedLabel}</span>
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <ul className="absolute left-0 top-full z-50 mt-1 min-w-[320px] max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {addresses.map((address) => (
            <li key={String(address.id)}>
              <button
                className={`block w-full px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                  selectedId === address.id ? 'bg-indigo-50 font-medium text-indigo-700' : ''
                }`}
                onClick={() => handleSelectAddress(address)}
                type="button"
              >
                <span className="block">{formatAddressLabel(address)}</span>
                {address.isDefaultShipping && (
                  <span className="text-xs text-gray-400">(Default Shipping)</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
