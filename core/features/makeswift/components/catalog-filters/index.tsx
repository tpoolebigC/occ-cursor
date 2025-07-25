'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CatalogFiltersProps {
  onFilterChange?: (filters: any) => void
}

export default function CatalogFilters({ onFilterChange }: CatalogFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['category', 'price'])
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    brand: '',
    availability: ''
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Automotive'
  ]

  const brands = [
    'Apple',
    'Samsung',
    'Nike',
    'Adidas',
    'Sony',
    'LG'
  ]

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900"
        >
          Category
          {expandedSections.includes('category') ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.includes('category') && (
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={filters.category === category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900"
        >
          Price Range
          {expandedSections.includes('price') ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.includes('price') && (
          <div className="mt-3 space-y-2">
            {['Under $50', '$50 - $100', '$100 - $200', '$200 - $500', 'Over $500'].map((range) => (
              <label key={range} className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  value={range}
                  checked={filters.priceRange === range}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{range}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div>
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900"
        >
          Brand
          {expandedSections.includes('brand') ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.includes('brand') && (
          <div className="mt-3 space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center">
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={filters.brand === brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div>
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900"
        >
          Availability
          {expandedSections.includes('availability') ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.includes('availability') && (
          <div className="mt-3 space-y-2">
            {['In Stock', 'Out of Stock', 'Pre-order'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  value={status}
                  checked={filters.availability === status}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setFilters({
            category: '',
            priceRange: '',
            brand: '',
            availability: ''
          })
          onFilterChange?.({})
        }}
        className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Clear All Filters
      </button>
    </div>
  )
} 