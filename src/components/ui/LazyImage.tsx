import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  placeholder?: React.ReactNode;
  fallback?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: string;
  skeletonHeight?: number | string;
  skeletonWidth?: number | string;
  /** Eager load (no intersection gate, loading="eager"). Use for above-the-fold avatars. */
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  fallback,
  objectFit = 'cover',
  aspectRatio,
  skeletonHeight,
  skeletonWidth,
  priority = false,
  onLoad,
  onError,
  style,
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [containerRef, isInView] = useInView('50px', true);

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoaded(false);
      setHasError(false);
    });
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  const shouldLoad = priority || isInView;

  const renderPlaceholder = () => {
    if (placeholder === null) return null;
    if (placeholder) return placeholder;
    return (
      <Skeleton
        className="absolute left-0 top-0 h-full w-full rounded-none"
        style={{
          width: skeletonWidth ?? '100%',
          height: skeletonHeight ?? '100%',
        }}
      />
    );
  };

  const imageSrc = hasError && fallback ? fallback : src;
  const showBrokenPlaceholder = hasError && !fallback;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: aspectRatio as React.CSSProperties['aspectRatio'], ...style }}
    >
      {!isLoaded && renderPlaceholder()}
      {showBrokenPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
          <ImageOff className="size-8 text-muted-foreground/50" />
        </div>
      ) : (
        shouldLoad && (
          <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className={cn(
              'absolute left-0 top-0 h-full w-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              props.onClick && 'cursor-pointer',
            )}
            style={{ objectFit }}
            {...Object.fromEntries(
              Object.entries(props).filter(
                ([key]) =>
                  ![
                    'ref',
                    'style',
                    'onClick',
                    'objectFit',
                    'aspectRatio',
                    'skeletonHeight',
                    'skeletonWidth',
                    'placeholder',
                    'fallback',
                  ].includes(key)
              )
            )}
          />
        )
      )}
    </div>
  );
}
