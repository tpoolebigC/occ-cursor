import React from 'react';

export interface ChartProps {
  data: any[];
  type?: 'bar' | 'line' | 'pie';
  className?: string;
}

export function Chart({ 
  data, 
  type = 'bar', 
  className = '' 
}: ChartProps) {
  return (
    <div className={`chart chart-${type} ${className}`}>
      <div className="chart-placeholder">
        Chart component - {type} chart with {data.length} data points
      </div>
    </div>
  );
} 