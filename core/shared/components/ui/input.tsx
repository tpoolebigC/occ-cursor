import React from 'react';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Input({ 
  type = 'text', 
  placeholder = '', 
  value = '', 
  onChange, 
  className = '' 
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`input ${className}`}
    />
  );
} 