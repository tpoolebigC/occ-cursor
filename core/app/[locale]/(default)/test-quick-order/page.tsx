'use client';

import { useState } from 'react';

export default function TestQuickOrderPage() {
  const [testResult, setTestResult] = useState<string>('');

  const testSearch = async () => {
    try {
      setTestResult('Testing search...');
      
      // Test the search function directly
      const response = await fetch('/api/test-search?term=test');
      const result = await response.json();
      
      setTestResult(`Search test result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Search test error: ${error}`);
    }
  };

  const testAddToCart = async () => {
    try {
      setTestResult('Testing add to cart...');
      
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('quantity', '1');
      
      const response = await fetch('/api/product/add-to-cart', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      setTestResult(`Add to cart test result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Add to cart test error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Quick Order Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Search
        </button>
        
        <button
          onClick={testAddToCart}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Add to Cart
        </button>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap">{testResult || 'No test run yet'}</pre>
        </div>
      </div>
    </div>
  );
} 