import React from 'react';

export interface TableProps {
  headers: string[];
  data: any[][];
  className?: string;
}

export function Table({ 
  headers, 
  data, 
  className = '' 
}: TableProps) {
  return (
    <table className={`table ${className}`}>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
} 