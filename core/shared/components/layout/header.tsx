import React from 'react';

export interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Header({ 
  title = '', 
  children, 
  className = '' 
}: HeaderProps) {
  return (
    <header className={`header ${className}`}>
      {title && <h1 className="header-title">{title}</h1>}
      {children}
    </header>
  );
} 