import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'PENDING_CLOSE' | 'CLOSED' | 'SPAM';

interface LeadStatusProgressProps {
  status: LeadStatus | string | null | undefined;
  className?: string;
  compact?: boolean;
}

const MAIN_STEP_KEYS: LeadStatus[] = ['NEW', 'IN_PROGRESS', 'PENDING_CLOSE', 'CLOSED'];

const STATUS_ORDER: Record<LeadStatus, number> = {
  NEW: 0,
  IN_PROGRESS: 1,
  PENDING_CLOSE: 2,
  CLOSED: 3,
  SPAM: -1,
};

const STEP_TRANSLATION_KEYS: Record<LeadStatus, string> = {
  NEW: 'leads.new',
  IN_PROGRESS: 'leads.in_progress',
  PENDING_CLOSE: 'leads.pending_close',
  CLOSED: 'leads.closed',
  SPAM: 'leads.spam',
};

const STEP_COUNT = MAIN_STEP_KEYS.length;
/** Center of column i in a 4-column grid: (2i + 1) / (2 * STEP_COUNT) */
const TRACK_START_PERCENT = (1 / (2 * STEP_COUNT)) * 100;
const TRACK_SPAN_PERCENT = ((STEP_COUNT - 1) / STEP_COUNT) * 100;

export function LeadStatusProgress({ status, className, compact = false }: LeadStatusProgressProps) {
  const { t } = useTranslation();
  const currentStatus = (status ?? 'NEW') as LeadStatus;
  const isSpam = currentStatus === 'SPAM';
  const currentOrder = STATUS_ORDER[currentStatus] ?? 0;

  const mainSteps = MAIN_STEP_KEYS.map((key) => ({ key, label: t(STEP_TRANSLATION_KEYS[key]) }));

  const dotSize = compact ? 'h-7 w-7' : 'h-9 w-9';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';
  const ringSize = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const trackTop = compact ? 'top-3.5' : 'top-[18px]';

  const progressWidth =
    currentOrder <= 0 ? 0 : ((currentOrder / (STEP_COUNT - 1)) * TRACK_SPAN_PERCENT);

  if (isSpam) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {t('leads.spam')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full">
        {/* Background track — full span between first and last dot centers */}
        <div
          className={cn(
            'pointer-events-none absolute h-1 -translate-y-1/2 rounded-full bg-[#E9ECEF] dark:bg-white/10',
            trackTop,
          )}
          style={{ left: `${TRACK_START_PERCENT}%`, width: `${TRACK_SPAN_PERCENT}%` }}
          aria-hidden
        />
        {/* Active progress */}
        {progressWidth > 0 ? (
          <div
            className={cn(
              'pointer-events-none absolute h-1 -translate-y-1/2 rounded-full bg-[#E97525] transition-all duration-500',
              trackTop,
            )}
            style={{ left: `${TRACK_START_PERCENT}%`, width: `${progressWidth}%` }}
            aria-hidden
          />
        ) : null}

        <div className="relative grid w-full grid-cols-4">
          {mainSteps.map((step) => {
            const isCompleted = STATUS_ORDER[step.key] < currentOrder;
            const isCurrent = step.key === currentStatus;

            return (
              <div key={step.key} className="flex min-w-0 flex-col items-center px-1">
                <div
                  className={cn(
                    'relative z-10 flex shrink-0 items-center justify-center rounded-full ring-2 ring-[#FAFBFC] transition duration-300 dark:ring-[hsl(var(--cabinet-card-bg))]',
                    dotSize,
                    isCompleted && 'bg-[#E97525] text-white ring-[#E97525]/20',
                    isCurrent &&
                      step.key === 'PENDING_CLOSE' &&
                      'animate-pulse bg-[#c45f1a] text-white ring-4 ring-[#E97525]/25',
                    isCurrent &&
                      step.key !== 'PENDING_CLOSE' &&
                      'bg-[#E97525] text-white ring-4 ring-[#E97525]/25',
                    !isCompleted &&
                      !isCurrent &&
                      'bg-[#F1F3F5] text-[#ADB5BD] ring-[#E9ECEF] dark:bg-white/10 dark:text-white/40 dark:ring-white/10',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className={cn('shrink-0', iconSize)} />
                  ) : (
                    <Circle className={cn('shrink-0', ringSize)} strokeWidth={2.5} />
                  )}
                </div>

                {!compact ? (
                  <span
                    className={cn(
                      'mt-2 w-full text-center text-[11px] font-semibold leading-snug sm:text-xs',
                      'line-clamp-2 break-words hyphens-auto',
                      isCompleted || isCurrent
                        ? 'text-[#E97525] dark:text-[#f08540]'
                        : 'text-[#6C757D] dark:text-white/45',
                    )}
                    title={step.label}
                  >
                    {step.label}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
