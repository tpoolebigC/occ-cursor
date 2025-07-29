// Shared Module
// This module contains shared components, hooks, utilities, and types
// that are used across multiple features

// Export components without conflicts
export { Button } from './components/ui/button';
export type { ButtonProps } from './components/ui/button';
export { Input } from './components/ui/input';
export type { InputProps } from './components/ui/input';
export { Modal } from './components/ui/modal';
export type { ModalProps } from './components/ui/modal';
export { Header } from './components/layout/header';
export type { HeaderProps } from './components/layout/header';
export { Footer } from './components/layout/footer';
export type { FooterProps } from './components/layout/footer';
export { Sidebar } from './components/layout/sidebar';
export type { SidebarProps } from './components/layout/sidebar';
export { Form } from './components/forms/form';
export type { FormProps } from './components/forms/form';
export { Field } from './components/forms/field';
export type { FieldProps } from './components/forms/field';
export { Validation } from './components/forms/validation';
export type { ValidationProps } from './components/forms/validation';
export { Table } from './components/data-display/table';
export type { TableProps } from './components/data-display/table';
export { Chart } from './components/data-display/chart';
export type { ChartProps } from './components/data-display/chart';
export { Card } from './components/data-display/card';
export type { CardProps } from './components/data-display/card';

// Export hooks
export * from './hooks';

// Export types (excluding UI types that conflict with components)
export * from './types/common';
export * from './types/api';

// Export utils
export * from './utils'; 