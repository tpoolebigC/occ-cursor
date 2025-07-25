// Makeswift Component Base
// Base component utilities for Makeswift components

import { ComponentType } from 'react';

export interface Component {
  component: ComponentType<any>;
  props: Record<string, any>;
}

export function createComponent<T = any>(
  component: ComponentType<T>,
  props: Partial<T> = {}
): Component {
  return {
    component,
    props: props as Record<string, any>,
  };
} 