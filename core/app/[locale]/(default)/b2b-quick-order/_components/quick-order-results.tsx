'use client';

import { useTranslations } from 'next-intl';

export function QuickOrderResults() {
  const t = useTranslations('B2B.QuickOrder');

  return (
    <div className="space-y-4">
      <div className="text-center py-8 text-gray-600">
        <p>{t('resultsDescription')}</p>
      </div>
      
      {/* This could be expanded to show recent orders, favorites, etc. */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">{t('tips')}</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• {t('tip1')}</li>
          <li>• {t('tip2')}</li>
          <li>• {t('tip3')}</li>
        </ul>
      </div>
    </div>
  );
} 