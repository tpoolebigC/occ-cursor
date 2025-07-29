import React from 'react';

export interface FooterProps {
  children?: React.ReactNode;
  className?: string;
}

export function Footer({ 
  children, 
  className = '' 
}: FooterProps) {
  return (
    <footer className={`footer ${className}`}>
      {children}
    </footer>
  );
} 