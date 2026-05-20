import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { clientCardStaticCls, clientTextBody, clientTextTitle } from '@/lib/clientCabinetStyles';

type ClientEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function ClientEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: ClientEmptyStateProps) {
  return (
    <div
      className={cn(
        clientCardStaticCls,
        'flex flex-col items-center justify-center px-6 py-12 text-center sm:py-14',
        className,
      )}
    >
      <span className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12')}>
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h3 className={cn('mb-2 text-base font-semibold', clientTextTitle)}>{title}</h3>
      <p className={cn('max-w-sm', clientTextBody)}>{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
