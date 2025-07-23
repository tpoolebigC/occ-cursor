'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface QuoteSearchProps {
  className?: string;
  placeholder?: string;
  allowSearch?: boolean;
  onSearch?: (query: string) => void;
  debounceMs?: number;
}

export function QuoteSearch({
  className = '',
  placeholder = 'Search quotes...',
  allowSearch = true,
  onSearch,
  debounceMs = 300,
}: QuoteSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!allowSearch) return;

    const debounceTimer = setTimeout(() => {
      onSearch?.(searchQuery);
    }, debounceMs);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allowSearch, onSearch, debounceMs]);

  if (!allowSearch) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
} 