'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SWIPE_THRESHOLD = 50;

export interface ImageLightboxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Array of image URLs to display */
  images: string[];
  /** Initial index when opening (0-based) */
  initialIndex?: number;
  /** Current index (controlled mode) — if provided, use with onIndexChange for controlled navigation */
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

export function ImageLightboxModal({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  currentIndex: controlledIndex,
  onIndexChange,
  className,
}: ImageLightboxModalProps) {
  const isControlled = controlledIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(initialIndex);
  const index = isControlled ? controlledIndex : internalIndex;
  const setIndex = useCallback(
    (i: number) => {
      if (!isControlled) setInternalIndex(i);
      onIndexChange?.(i);
    },
    [isControlled, onIndexChange]
  );

  const total = images.length;
  const canGoPrev = total > 1;
  const canGoNext = total > 1;
  const prevIndex = index <= 0 ? total - 1 : index - 1;
  const nextIndex = index >= total - 1 ? 0 : index + 1;
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    setIndex(prevIndex);
  }, [canGoPrev, prevIndex, setIndex]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    setIndex(nextIndex);
  }, [canGoNext, nextIndex, setIndex]);

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current && total > 0) {
      const i = Math.min(Math.max(0, initialIndex), Math.max(0, total - 1));
      queueMicrotask(() => setIndex(i));
    }
    prevOpenRef.current = open;
  }, [open, initialIndex, total, setIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, goPrev, goNext]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchEndX.current = e.touches[0].clientX;
    },
    []
  );
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }, [goPrev, goNext]);

  if (total === 0) return null;

  const src = images[index];
  if (!src) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
          onPointerDown={() => onOpenChange(false)}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-0 z-[61] flex items-center justify-center overflow-hidden outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200',
            className
          )}
          onPointerDownOutside={(e) => e.target === e.currentTarget && onOpenChange(false)}
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          {/* Close button */}

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex size-11 sm:size-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/30 backdrop-blur-md transition-all hover:bg-black/70 active:bg-black/80 touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/50 [@supports(padding:env(safe-area-inset-top))]:top-[max(0.75rem,env(safe-area-inset-top))] [@supports(padding:env(safe-area-inset-right))]:right-[max(1rem,env(safe-area-inset-right))]"
            aria-label="Close"
          >
            <X className="size-5 sm:size-6" />
          </button>

          {/* Prev */}
          {canGoPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-2 sm:left-4 z-20 flex size-11 sm:size-12 md:size-14 items-center justify-center rounded-full bg-black/60 text-white border border-white/30 backdrop-blur-md transition-all hover:bg-black/70 active:bg-black/80 touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/50 [@supports(padding:env(safe-area-inset-left))]:left-[max(0.5rem,env(safe-area-inset-left))]"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6 sm:size-7 md:size-8" />
            </button>
          )}

          {/* Image area - swipe zone */}
          <div
            className="relative flex max-h-[90dvh] max-w-[calc(100vw-2rem)] sm:max-w-[90vw] items-center justify-center px-10 sm:px-16 md:px-20 py-14 sm:py-4"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={src}
                alt=""
                className="max-h-[75dvh] sm:max-h-[85dvh] max-w-full select-none object-contain touch-none"
                draggable={false}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
          </div>

          {/* Next */}
          {canGoNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 sm:right-4 z-20 flex size-11 sm:size-12 md:size-14 items-center justify-center rounded-full bg-black/60 text-white border border-white/30 backdrop-blur-md transition-all hover:bg-black/70 active:bg-black/80 touch-manipulation focus:outline-none focus:ring-2 focus:ring-white/50 [@supports(padding:env(safe-area-inset-right))]:right-[max(0.5rem,env(safe-area-inset-right))]"
              aria-label="Next image"
            >
              <ChevronRight className="size-6 sm:size-7 md:size-8" />
            </button>
          )}

          {/* Counter */}
          {total > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/70 text-white border border-white/30 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium backdrop-blur-md [@supports(padding:env(safe-area-inset-bottom))]:bottom-[max(1rem,env(safe-area-inset-bottom))]">
              {index + 1} / {total}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
