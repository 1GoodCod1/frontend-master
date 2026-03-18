import { Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComponentProps } from 'react';

export function MastersCardSkeleton() {
  return (
    <div className="rounded-2xl sm:rounded-xl border border-gray-200 dark:border-white/[0.08] bg-card p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-lg shadow-black/5 dark:shadow-none">
      <Skeleton className="h-11 w-11 sm:h-14 sm:w-14 rounded-full" />
      <Skeleton className="h-5 sm:h-6 w-[70%]" />
      <Skeleton className="h-4 sm:h-5 w-[50%]" />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded" />
        ))}
      </div>
    </div>
  );
}

export function MastersMapSkeleton() {
  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-card animate-pulse"
      style={{ minHeight: 400 }}
    >
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Map className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground/40">Loading map…</p>
        </div>
      </div>
    </div>
  );
}

export const MastersVirtualizedGridList = (props: ComponentProps<'div'>) => (
  <div
    {...props}
    className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:[grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))]"
  />
);

export const MastersVirtualizedGridItem = (props: ComponentProps<'div'>) => (
  <div {...props} className="min-w-0" />
);
