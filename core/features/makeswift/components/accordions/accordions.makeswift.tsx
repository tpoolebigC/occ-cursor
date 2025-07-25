import { List, Select, Shape, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { Accordion, Accordions } from '@/vibes/soul/primitives/accordions';
import { runtime } from '~/features/makeswift/utils/runtime';

interface MSAccordion {
  title: string;
  content: string;
}

interface MSAccordionsProps {
  className: string;
  type: 'single' | 'multiple';
  accordions: MSAccordion[];
}

runtime.registerComponent(
  function MSAccordions({ className, accordions, type }: MSAccordionsProps) {
    return (
      <Accordions
        className={className}
        collapsible={type === 'single' ? true : undefined}
        type={type}
        items={accordions}
      />
    );
  },
  {
    type: 'primitive-accordions',
    label: 'Basic / Accordions',
    icon: 'carousel',
    props: {
      className: Style(),
      accordions: List({
        label: 'Accordions',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'This is an accordion title' }),
            content: TextInput({ label: 'Content', defaultValue: 'This is accordion content' }),
          },
        }),
        getItemLabel(accordion) {
          return accordion?.title || 'Accordion';
        },
      }),
      type: Select({
        label: 'Selection type',
        options: [
          { value: 'single', label: 'Single' },
          { value: 'multiple', label: 'Multiple' },
        ],
        defaultValue: 'multiple',
      }),

    },
  },
);
