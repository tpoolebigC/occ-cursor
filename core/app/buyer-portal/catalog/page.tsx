import { MakeswiftComponent } from '@makeswift/runtime/next'
import { notFound } from 'next/navigation'

export default async function CatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="mt-2 text-gray-600">Browse and search our complete product catalog</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              <MakeswiftComponent componentId="catalog-filters" />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <MakeswiftComponent componentId="catalog-search" />
            </div>

            {/* Product Grid */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                  <MakeswiftComponent componentId="catalog-sort" />
                </div>
              </div>
              <div className="p-6">
                <MakeswiftComponent componentId="catalog-grid" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 