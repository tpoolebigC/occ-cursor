import { ReactNode } from 'react';
import { BuyerPortalHeader } from './components/buyer-portal-header';
import { BuyerPortalSidebar } from './components/buyer-portal-sidebar';

interface BuyerPortalLayoutProps {
  children: ReactNode;
}

export default function BuyerPortalLayout({ children }: BuyerPortalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <BuyerPortalHeader />
      
      <div className="flex pt-16">
        <BuyerPortalSidebar />
        
        <main className="flex-1 lg:ml-64 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 