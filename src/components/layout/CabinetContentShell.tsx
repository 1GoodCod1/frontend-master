import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CabinetFooter } from '@/components/layout/CabinetFooter';

/** App header is fixed h-16 — cabinet column fills the rest of the viewport. */
export const CABINET_COLUMN_HEIGHT = 'h-[calc(100dvh-4rem)]';

type CabinetContentShellProps = {
  children: ReactNode;
  showFooter?: boolean;
  mobileTopPadding?: boolean;
  contentClassName?: string;
};

/**
 * Right column of cabinet layouts.
 * Explicit viewport height + grid rows [1fr auto] keeps footer at the bottom.
 */
export function CabinetContentShell({
  children,
  showFooter = true,
  mobileTopPadding = false,
  contentClassName,
}: CabinetContentShellProps) {
  return (
    <div
      className={cn(
        'min-h-0 min-w-0 flex-1 overflow-hidden',
        CABINET_COLUMN_HEIGHT,
        showFooter ? 'grid grid-rows-[1fr_auto]' : 'flex flex-col',
      )}
    >
      <main
        data-app-scroll-region=""
        className={cn(
          'min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain',
          'bg-[hsl(var(--cabinet-main-bg))] transition-colors duration-300',
          mobileTopPadding && 'pt-16 md:pt-0',
        )}
      >
        <div className={cn('mx-auto min-w-0 px-4 py-6 md:px-6', contentClassName)}>{children}</div>
      </main>
      {showFooter ? <CabinetFooter /> : null}
    </div>
  );
}
