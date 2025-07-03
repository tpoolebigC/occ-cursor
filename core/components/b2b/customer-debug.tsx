'use client';

import { useEffect, useState } from 'react';

export function CustomerDebug() {
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  useEffect(() => {
    // Check if we're on an account page
    if (window.location.pathname.includes('/account')) {
      console.log('Customer Debug: On account page');
      
      // Check for B2B portal elements
      const b2bElements = document.querySelectorAll('[data-b3-portal]');
      console.log('B2B Portal Elements:', b2bElements);
      
      // Check for B3 global object
      console.log('B3 Global Object:', (window as any).B3);
      
      // Check for buyer portal scripts
      const scripts = document.querySelectorAll('script[src*="buyer-portal"]');
      console.log('Buyer Portal Scripts:', scripts);
      
      // Try to get customer info from any available data
      const customerData = (window as any).customerData || (window as any).B3?.customer;
      console.log('Customer Data:', customerData);
      
      setCustomerInfo({
        b2bElements: b2bElements.length,
        b3Object: !!(window as any).B3,
        buyerPortalScripts: scripts.length,
        customerData: customerData
      });
    }
  }, []);

  if (!customerInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>B2B Debug Info:</h4>
      <ul>
        <li>B2B Elements: {customerInfo.b2bElements}</li>
        <li>B3 Object: {customerInfo.b3Object ? 'Yes' : 'No'}</li>
        <li>Buyer Portal Scripts: {customerInfo.buyerPortalScripts}</li>
        <li>Customer Data: {customerInfo.customerData ? 'Available' : 'Not Found'}</li>
      </ul>
    </div>
  );
} 