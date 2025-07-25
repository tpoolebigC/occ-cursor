import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { notFound } from 'next/navigation';

import { getPageSnapshot } from '~/features/makeswift/services/client';

export default async function CustomBuyerPortalPage() {
  // Try to get the Makeswift page snapshot for the custom buyer portal
  const snapshot = await getPageSnapshot({
    path: '/custom-buyer-portal',
    locale: 'en'
  });

  if (snapshot) {
    // If a Makeswift page exists, render it
    return <MakeswiftPage snapshot={snapshot} />;
  }

  // Fallback to a default page with instructions
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Custom Buyer Portal
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This page is designed to be customized in Makeswift
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Setup Instructions
            </h2>
            <div className="text-left text-blue-700 space-y-2">
              <p>✅ <strong>Makeswift Integration:</strong> The page is connected to Makeswift</p>
              <p>✅ <strong>B2B Components:</strong> All B2B components are available</p>
              <p>✅ <strong>API Endpoints:</strong> B2B data endpoints are configured</p>
              <p>🔄 <strong>Next Step:</strong> Customize this page in Makeswift</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Available Components</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Customer Selector</li>
                <li>• Account Navigation</li>
                <li>• Metrics Cards (Orders, Revenue, etc.)</li>
                <li>• Order History & Tables</li>
                <li>• Quote Management</li>
                <li>• Charts & Analytics</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Data Sources</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>/api/b2b/customers</code> - Customer data</li>
                <li>• <code>/api/b2b/orders</code> - Order history</li>
                <li>• <code>/api/b2b/quotes</code> - Quote management</li>
                <li>• <code>/api/b2b/stats</code> - Analytics data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 