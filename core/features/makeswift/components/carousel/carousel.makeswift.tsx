import { Checkbox, List, Select, Shape, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '@/vibes/soul/primitives/carousel';
import { runtime } from '~/features/makeswift/utils/runtime';

interface Slide {
  children: React.ReactNode;
}

interface MSCarouselProps {
  className: string;
  slides?: Slide[];
  showScrollbar: boolean;
  showArrows: boolean;
  colorScheme: 'light' | 'dark';
}

runtime.registerComponent(
  function MSCarousel({
    className,
    slides,
    showScrollbar = true,
    showArrows = true,
    colorScheme,
  }: MSCarouselProps) {
    return (
      <div className={className}>
        {!slides || slides.length < 1 ? (
          <div className="p-4 text-center text-lg text-gray-400">Add items to the carousel</div>
        ) : (
          <Carousel>
            <CarouselContent className="mb-10">
              {slides.map(({ children }, index) => (
                <CarouselItem
                  className="basis-full @md:basis-1/2 @lg:basis-1/3 @2xl:basis-1/4"
                  key={index}
                >
                  {children}
                </CarouselItem>
              ))}
            </CarouselContent>
            {(showScrollbar || showArrows) && (
              <div className="mt-10 flex w-full items-center justify-between">
                {showScrollbar && <CarouselScrollbar colorScheme={colorScheme} />}
                {showArrows && <CarouselButtons colorScheme={colorScheme} />}
              </div>
            )}
          </Carousel>
        )}
      </div>
    );
  },
  {
    type: 'primitive-carousel',
    label: 'Basic / Carousel',
    icon: 'carousel',
    props: {
      className: Style(),
      slides: List({
        label: 'Items',
        type: Shape({
          type: {
            name: TextInput({ label: 'Name', defaultValue: '' }),
            children: Slot(),
          },
        }),
        getItemLabel(slide) {
          return slide?.name || 'Item';
        },
      }),
      showScrollbar: Checkbox({
        label: 'Show scrollbar',
        defaultValue: true,
      }),
      showArrows: Checkbox({
        label: 'Show arrows',
        defaultValue: true,
      }),
      colorScheme: Select({
        label: 'Color scheme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'light',
      }),
      hideOverflow: Checkbox({
        label: 'Hide overflow',
        defaultValue: true,
      }),
    },
  },
);
