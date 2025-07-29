import { Suspense } from 'react';
import { 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Plus,
  Search,
  Filter
} from 'lucide-react';

import { CustomerSelector } from '~/features/makeswift/components/customer-selector';

export default function CustomersPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your B2B customers and their information
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">John Doe</h3>
                <p className="text-sm text-gray-500">john.doe@acme.com</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Acme Corporation</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>New York, NY</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Orders</p>
                <p className="font-medium text-gray-900">24</p>
              </div>
              <div>
                <p className="text-gray-500">Revenue</p>
                <p className="font-medium text-gray-900">$45,230</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Jane Smith</h3>
                <p className="text-sm text-gray-500">jane.smith@enterprise.com</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Enterprise Inc</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>+1 (555) 987-6543</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>San Francisco, CA</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Orders</p>
                <p className="font-medium text-gray-900">18</p>
              </div>
              <div>
                <p className="text-gray-500">Revenue</p>
                <p className="font-medium text-gray-900">$32,150</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Bob Johnson</h3>
                <p className="text-sm text-gray-500">bob.johnson@retail.com</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Retail Solutions</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>+1 (555) 456-7890</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Chicago, IL</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Orders</p>
                <p className="font-medium text-gray-900">8</p>
              </div>
              <div>
                <p className="text-gray-500">Revenue</p>
                <p className="font-medium text-gray-900">$12,450</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Card 4 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Sarah Wilson</h3>
                <p className="text-sm text-gray-500">sarah.wilson@tech.com</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Tech Innovations</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>+1 (555) 321-6540</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Austin, TX</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Orders</p>
                <p className="font-medium text-gray-900">31</p>
              </div>
              <div>
                <p className="text-gray-500">Revenue</p>
                <p className="font-medium text-gray-900">$67,890</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Card 5 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Mike Davis</h3>
                <p className="text-sm text-gray-500">mike.davis@manufacturing.com</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Inactive
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Manufacturing Co</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>+1 (555) 789-0123</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Detroit, MI</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Orders</p>
                <p className="font-medium text-gray-900">5</p>
              </div>
              <div>
                <p className="text-gray-500">Revenue</p>
                <p className="font-medium text-gray-900">$8,750</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Customer Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <div className="text-center">
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Customer</h3>
            <p className="text-sm text-gray-500 mb-4">
              Create a new customer account
            </p>
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
          <span className="font-medium">24</span> customers
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-2 border border-blue-500 rounded-md text-sm font-medium text-blue-600 bg-blue-50">
            1
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 