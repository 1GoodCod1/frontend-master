import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, CalendarDays, Calendar, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';

import { useMastersViewsHistoryQuery } from '@/features/masters/mastersApi';
import { LoadingState } from '@/components/common/States';
import { cn } from '@/lib/utils';

type Period = 'week' | 'month';

interface ProfileViewsHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileViewsHistoryModal({
  open,
  onOpenChange,
}: ProfileViewsHistoryModalProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('week');
  const { data, isLoading, isError } = useMastersViewsHistoryQuery(
    { period, limit: 12 },
    { skip: !open },
  );

  const items: { label: string; views: number }[] = Array.isArray(data)
    ? (data as { label: string; views: number }[])
    : ((data as unknown as { data?: { label: string; views: number }[] })?.data ?? []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <History className="size-4.5" />
            </div>
            {t('dashboard.viewsHistory.title')}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Period toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 dark:bg-white/[0.04] rounded-xl border border-border/40">
            <button
              onClick={() => setPeriod('week')}
              className={cn(
                'flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition duration-200',
                period === 'week'
                  ? 'bg-white dark:bg-white/10 text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5',
              )}
            >
              <CalendarDays className="size-4 shrink-0" />
              <span className="truncate">{t('dashboard.viewsHistory.byWeek')}</span>
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={cn(
                'flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition duration-200',
                period === 'month'
                  ? 'bg-white dark:bg-white/10 text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5',
              )}
            >
              <Calendar className="size-4 shrink-0" />
              <span className="truncate">{t('dashboard.viewsHistory.byMonth')}</span>
            </button>
          </div>

          {/* Content */}
          {isLoading && (
            <div className="min-h-[200px] flex items-center justify-center rounded-xl border border-border bg-muted/20">
              <LoadingState label={t('dashboard.loading')} />
            </div>
          )}
          {isError && (
            <p className="text-sm text-destructive py-4 text-center">
              {t('dashboard.viewsHistory.error')}
            </p>
          )}
          {!isLoading && !isError && items.length === 0 && (
            <div className="py-10 flex flex-col items-center gap-3 text-center rounded-xl border border-dashed border-border bg-muted/20">
              <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center">
                <Eye className="size-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.viewsHistory.empty')}
              </p>
            </div>
          )}
          {!isLoading && !isError && items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'group flex items-center justify-between gap-4 rounded-xl border px-4 py-3 min-w-0 transition-colors duration-150',
                    item.views > 0
                      ? 'border-amber-200/70 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5'
                      : 'border-border bg-muted/20 dark:bg-white/[0.02]',
                  )}
                >
                  <span className="text-sm font-medium text-foreground truncate min-w-0">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-sm font-bold tabular-nums pl-2 min-w-[1.5rem] text-right',
                      item.views > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground',
                    )}
                  >
                    {item.views}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
