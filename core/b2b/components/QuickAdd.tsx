'use client';

import { useState } from 'react';

interface QuickAddItem {
  sku: string;
  quantity: number;
  options?: string;
}

interface QuickAddProps {
  onBulkAdd: (items: QuickAddItem[]) => void;
}

export default function QuickAdd({ onBulkAdd }: QuickAddProps) {
  const [bulkInput, setBulkInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedItems, setProcessedItems] = useState<QuickAddItem[]>([]);

  const parseBulkInput = (input: string): QuickAddItem[] => {
    const lines = input.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const parts = line.split(',').map(part => part.trim());
      const sku = parts[0] || '';
      const quantity = parseInt(parts[1]) || 1;
      const options = parts[2] || '';
      
      return {
        sku,
        quantity,
        options
      };
    });
  };

  const handleProcessBulk = async () => {
    if (!bulkInput.trim()) return;

    setIsProcessing(true);
    try {
      const items = parseBulkInput(bulkInput);
      setProcessedItems(items);
      
      // Call the bulk add function
      await onBulkAdd(items);
      
      // Clear input after successful processing
      setBulkInput('');
      setProcessedItems([]);
    } catch (error) {
      console.error('Error processing bulk add:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkInput(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Quick Add</h3>
      
      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File (Optional)
          </label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isProcessing}
          />
          <p className="text-sm text-gray-500 mt-1">
            Or paste your data directly below
          </p>
        </div>

        {/* Bulk Input */}
        <div>
          <label htmlFor="bulk-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter SKUs and Quantities
          </label>
          <textarea
            id="bulk-input"
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Enter one item per line:&#10;SKU123, 2&#10;PRODUCT456, 1&#10;ITEM789, 5, Red"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={8}
            disabled={isProcessing}
          />
        </div>

        {/* Process Button */}
        <button
          onClick={handleProcessBulk}
          disabled={!bulkInput.trim() || isProcessing}
          className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isProcessing ? 'Processing...' : 'Process Bulk Add'}
        </button>

        {/* Preview */}
        {processedItems.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Preview ({processedItems.length} items):</h4>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
              {processedItems.map((item, index) => (
                <div key={index} className="text-sm text-gray-600 py-1">
                  {item.sku} - Qty: {item.quantity}
                  {item.options && ` - Options: ${item.options}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Format Instructions:</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>CSV Format:</strong> SKU, Quantity, Options (optional)</p>
          <p><strong>Example:</strong></p>
          <pre className="bg-white p-2 rounded text-xs">
{`SNAKE-001, 2
SPRAY-001, 1
PLANT-123, 5, Large Size`}
          </pre>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>One item per line</li>
            <li>Separate fields with commas</li>
            <li>Quantity defaults to 1 if not specified</li>
            <li>Options are optional</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 