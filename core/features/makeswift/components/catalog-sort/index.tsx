'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface CatalogSortProps {
  onSortChange?: (sortBy: string) => void
}

export default function CatalogSort({ onSortChange }: CatalogSortProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSort, setSelectedSort] = useState('relevance')
  const router = useRouter()
  const searchParams = useSearchParams()

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'lowest_price', label: 'Price Low to High' },
    { value: 'highest_price', label: 'Price High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'best_selling', label: 'Best Selling' }
  ]

  // Initialize selected sort from URL params
  useEffect(() => {
    const sortParam = searchParams.get('sort')
    if (sortParam) {
      setSelectedSort(sortParam)
    }
  }, [searchParams])

  const handleSortChange = (value: string) => {
    setSelectedSort(value)
    setIsOpen(false)
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('sort', value)
    
    // Preserve the search term
    const term = searchParams.get('term')
    if (term) {
      newSearchParams.set('term', term)
    }
    
    const url = `/search?${newSearchParams.toString()}`
    router.push(url)
    
    // Call the callback if provided
    onSortChange?.(value)
  }

  const selectedOption = sortOptions.find(option => option.value === selectedSort)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm text-gray-700">Sort by: {selectedOption?.label}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedSort === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 