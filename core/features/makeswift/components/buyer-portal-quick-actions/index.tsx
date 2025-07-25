// Buyer Portal Quick Actions Component
// Component for displaying quick actions in the buyer portal

import React from 'react';

interface BuyerPortalQuickActionsProps {
  className?: string;
}

export const BuyerPortalQuickActions: React.FC<BuyerPortalQuickActionsProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`buyer-portal-quick-actions ${className}`}>
      <div className="quick-actions-grid">
        <button className="quick-action-btn">
          <span>Create Quote</span>
        </button>
        <button className="quick-action-btn">
          <span>View Orders</span>
        </button>
        <button className="quick-action-btn">
          <span>Shopping Lists</span>
        </button>
        <button className="quick-action-btn">
          <span>Account Settings</span>
        </button>
      </div>
    </div>
  );
}; 