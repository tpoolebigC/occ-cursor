'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  brand: string
  rating: number
  reviewCount: number
  inStock: boolean
}

interface CatalogGridProps {
  products?: Product[]
  loading?: boolean
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
}

export default function CatalogGrid({ 
  products = [], 
  loading = false,
  onAddToCart,
  onAddToWishlist 
}: CatalogGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // Mock products if none provided
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 129.99,
      originalPrice: 159.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      category: 'Electronics',
      brand: 'Sony',
      rating: 4.5,
      reviewCount: 128,
      inStock: true
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      description: 'Track your fitness goals with this advanced smartwatch',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      category: 'Electronics',
      brand: 'Apple',
      rating: 4.8,
      reviewCount: 256,
      inStock: true
    },
    {
      id: '3',
      name: 'Running Shoes',
      description: 'Comfortable running shoes for all terrains',
      price: 89.99,
      originalPrice: 119.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
      category: 'Sports & Outdoors',
      brand: 'Nike',
      rating: 4.3,
      reviewCount: 89,
      inStock: false
    },
    {
      id: '4',
      name: 'Coffee Maker',
      description: 'Automatic coffee maker with programmable timer',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&h=300&fit=crop',
      category: 'Home & Garden',
      brand: 'Breville',
      rating: 4.6,
      reviewCount: 156,
      inStock: true
    }
  ]

  const displayProducts = products.length > 0 ? products : mockProducts
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = displayProducts.slice(startIndex, endIndex)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => onAddToWishlist?.(product.id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
              >
                <Heart className="h-4 w-4 text-gray-600" />
              </button>
              {!product.inStock && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                  Out of Stock
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase">{product.brand}</span>
                <div className="flex items-center">
                  {renderStars(product.rating)}
                  <span className="ml-1 text-xs text-gray-500">({product.reviewCount})</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onAddToCart?.(product.id)}
                disabled={!product.inStock}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  product.inStock
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.inStock ? (
                  <div className="flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </div>
                ) : (
                  'Out of Stock'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
} 