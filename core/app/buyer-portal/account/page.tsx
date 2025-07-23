import { MakeswiftComponent } from '@makeswift/runtime/next'
import { notFound } from 'next/navigation'

export default async function AccountPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account preferences and profile information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Menu</h2>
              <MakeswiftComponent componentId="account-navigation" />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <MakeswiftComponent componentId="profile-form" />
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
              <MakeswiftComponent componentId="company-form" />
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
              <MakeswiftComponent componentId="preferences-form" />
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
              <MakeswiftComponent componentId="security-form" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 