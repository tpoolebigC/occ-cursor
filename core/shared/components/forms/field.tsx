import React from 'react';

export interface FieldProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function Field({ 
  label, 
  name, 
  type = 'text', 
  placeholder = '', 
  required = false, 
  className = '' 
}: FieldProps) {
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={name} className="field-label">{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="field-input"
      />
    </div>
  );
} 