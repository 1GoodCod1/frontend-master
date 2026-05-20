import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  cabinetCardStaticCls,
  cabinetTextBody,
  cabinetTextTitle,
} from '@/lib/cabinetStyles';

type CabinetEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function CabinetEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: CabinetEmptyStateProps) {
  return (
    <div
      className={cn(
        cabinetCardStaticCls,
        'flex flex-col items-center justify-center px-6 py-12 text-center sm:py-14',
        className,
      )}
    >
      <span
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12',
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h3 className={cn('text-base font-semibold', cabinetTextTitle, description || action ? 'mb-2' : '')}>
        {title}
      </h3>
      {description ? <p className={cn('max-w-sm', cabinetTextBody)}>{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
