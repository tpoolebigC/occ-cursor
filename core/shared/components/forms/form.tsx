import React from 'react';

export interface FormProps {
  onSubmit?: (data: any) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Form({ 
  onSubmit, 
  children, 
  className = '' 
}: FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit} className={`form ${className}`}>
      {children}
    </form>
  );
} 