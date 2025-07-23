import { MakeswiftComponent } from '@makeswift/runtime/next'
import { notFound } from 'next/navigation'

export default async function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="mt-2 text-gray-600">Track your business performance and gain valuable insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MakeswiftComponent componentId="revenue-metric" />
          <MakeswiftComponent componentId="orders-metric" />
          <MakeswiftComponent componentId="customers-metric" />
          <MakeswiftComponent componentId="growth-metric" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
            <MakeswiftComponent componentId="revenue-chart" />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Volume</h2>
            <MakeswiftComponent componentId="orders-chart" />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
            <MakeswiftComponent componentId="products-chart" />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h2>
            <MakeswiftComponent componentId="segments-chart" />
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <MakeswiftComponent componentId="recent-orders-table" />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
            <MakeswiftComponent componentId="top-customers-table" />
          </div>
        </div>
      </div>
    </div>
  )
} 