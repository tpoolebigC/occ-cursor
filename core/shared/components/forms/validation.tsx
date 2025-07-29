import React from 'react';

export interface ValidationProps {
  error?: string;
  className?: string;
}

export function Validation({ 
  error, 
  className = '' 
}: ValidationProps) {
  if (!error) return null;

  return (
    <div className={`validation-error ${className}`}>
      {error}
    </div>
  );
} 