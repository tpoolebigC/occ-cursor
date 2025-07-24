'use client';

import { forwardRef, type Ref } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  buttonText?: string;
  buttonLink?: { href: string; openInNewTab?: boolean };
  autoplay?: boolean;
  autoplayInterval?: number;
  height?: 'small' | 'medium' | 'large' | 'full';
}

export const MakeswiftHomepageSlideshow = forwardRef(
  ({ 
    title = 'Discover what\'s new',
    subtitle = 'Shop our latest arrivals and find something fresh and exciting for your home.',
    backgroundImage,
    buttonText = 'Shop Now',
    buttonLink,
    autoplay = true,
    autoplayInterval = 5,
    height = 'large'
  }: Props, ref: Ref<HTMLDivElement>) => {
    const heightClasses = {
      small: 'h-64',
      medium: 'h-96',
      large: 'h-[600px]',
      full: 'h-screen',
    };

    return (
      <div
        ref={ref}
        className={`relative ${heightClasses[height]} w-full overflow-hidden`}
        style={{ width: '100%' }}
      >
        {backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center text-white">
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
              {title}
            </h1>
            <p className="mb-8 text-lg md:text-xl">
              {subtitle}
            </p>
            {buttonLink && (
              <a
                href={buttonLink.href}
                target={buttonLink.openInNewTab ? '_blank' : '_self'}
                rel={buttonLink.openInNewTab ? 'noopener noreferrer' : undefined}
                className="inline-block bg-gray-800 px-8 py-3 text-white transition-colors hover:bg-gray-700"
              >
                {buttonText}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  },
);

MakeswiftHomepageSlideshow.displayName = 'MakeswiftHomepageSlideshow'; 