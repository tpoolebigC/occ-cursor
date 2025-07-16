import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { QuickOrderForm } from './_components/quick-order-form';
import { QuickOrderResults } from './_components/quick-order-results';

export default async function B2BQuickOrderPage() {
  const t = await getTranslations('B2B.QuickOrder');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('searchTitle')}</h2>
            <Suspense fallback={<div>Loading search form...</div>}>
              <QuickOrderForm />
            </Suspense>
          </div>

          {/* Quick Order Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('resultsTitle')}</h2>
            <Suspense fallback={<div>Loading results...</div>}>
              <QuickOrderResults />
            </Suspense>
          </div>
        </div>

        {/* Debug Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <div className="text-sm space-y-1">
            <div><strong>Page URL:</strong> /b2b-quick-order</div>
            <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
            <div><strong>Algolia App ID:</strong> {process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? 'Set' : 'Not set'}</div>
            <div><strong>Algolia Index:</strong> {process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME || 'Not set'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 