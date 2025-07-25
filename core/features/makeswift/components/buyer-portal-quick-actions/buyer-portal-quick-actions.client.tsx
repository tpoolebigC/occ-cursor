'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BuyerPortalQuickActionsProps {
  showCreateQuote?: boolean;
  showBrowseCatalog?: boolean;
  showAccountSettings?: boolean;
  createQuoteText?: string;
  createQuoteDescription?: string;
  browseCatalogText?: string;
  browseCatalogDescription?: string;
  accountSettingsText?: string;
  accountSettingsDescription?: string;
}

export function BuyerPortalQuickActionsClient({
  showCreateQuote = true,
  showBrowseCatalog = true,
  showAccountSettings = true,
  createQuoteText = 'Create New Quote',
  createQuoteDescription = 'Request pricing for products',
  browseCatalogText = 'Browse Catalog',
  browseCatalogDescription = 'View available products',
  accountSettingsText = 'Account Settings',
  accountSettingsDescription = 'Manage customer information',
}: BuyerPortalQuickActionsProps) {
  return (
    <div className="space-y-3">
      {showCreateQuote && (
        <Link 
          href="/buyer-portal/quotes/new"
          className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-medium text-gray-900">{createQuoteText}</div>
            <div className="text-sm text-gray-500">{createQuoteDescription}</div>
          </div>
          <ChevronRight className="h-4 w-4 text-blue-600" />
        </Link>
      )}
      
      {showBrowseCatalog && (
        <Link 
          href="/buyer-portal/catalog"
          className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-medium text-gray-900">{browseCatalogText}</div>
            <div className="text-sm text-gray-500">{browseCatalogDescription}</div>
          </div>
          <ChevronRight className="h-4 w-4 text-blue-600" />
        </Link>
      )}
      
      {showAccountSettings && (
        <Link 
          href="/buyer-portal/account"
          className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-medium text-gray-900">{accountSettingsText}</div>
            <div className="text-sm text-gray-500">{accountSettingsDescription}</div>
          </div>
          <ChevronRight className="h-4 w-4 text-blue-600" />
        </Link>
      )}
    </div>
  );
} 