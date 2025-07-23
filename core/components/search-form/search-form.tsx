'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
        className="search-input"
      />
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
} 