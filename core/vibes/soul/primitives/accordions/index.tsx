'use client';

import { clsx } from 'clsx';

import { Accordion, AccordionItem } from '../accordion';

interface AccordionItemData {
  title: string;
  content: string;
}

interface AccordionsProps {
  items: AccordionItemData[];
  className?: string;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
}

export function Accordions({ items, className, type = 'single', collapsible = true }: AccordionsProps) {
  return (
    <Accordion type={type} collapsible={collapsible} className={clsx('w-full', className)}>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`} title={item.title}>
          {item.content}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function AccordionsSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('w-full space-y-4', className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

// Re-export Accordion for Makeswift compatibility
export { Accordion }; 