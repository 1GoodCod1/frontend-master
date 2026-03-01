import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const CardsSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-12 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3'
          )}
        >
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="mb-2 h-7 w-[70%]" />
            <Skeleton className="mb-2 h-5 w-[40%]" />
            <Skeleton className="mb-2 mt-2 h-[140px] rounded-lg" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-6 w-[72px] rounded-md" />
              <Skeleton className="h-6 w-[72px] rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <Skeleton className="h-11 w-1/2" />
      <Skeleton className="mt-2 h-6 w-[30%]" />
      <Skeleton className="mt-4 h-[220px] rounded-xl" />
      <Skeleton className="mt-4 h-40 rounded-xl" />
      <Skeleton className="mt-4 h-40 rounded-xl" />
    </div>
  );
};
