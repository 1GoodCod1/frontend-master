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

export function LeadStatusProgress({ status, className, compact = false }: LeadStatusProgressProps) {
    const { t } = useTranslation();
    const currentStatus = (status ?? 'NEW') as LeadStatus;
    const isSpam = currentStatus === 'SPAM';
    const currentOrder = STATUS_ORDER[currentStatus] ?? 0;

    const mainSteps = MAIN_STEP_KEYS.map((key) => ({ key, label: t(STEP_TRANSLATION_KEYS[key]) }));

    if (isSpam) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {t('leads.spam')}
                </div>
            </div>
        );
    }

    return (
        <div className={cn('w-full min-w-[260px]', className)}>
            {/* Row 1: circles (centered) + connector lines — symmetrical */}
            <div className="flex items-center w-full">
                {mainSteps.map((step, idx) => {
                    const isCompleted = STATUS_ORDER[step.key] < currentOrder;
                    const isCurrent = step.key === currentStatus;
                    const isLast = idx === mainSteps.length - 1;
                    const lineActive = isCompleted || (isCurrent && idx < currentOrder);

                    return (
                        <div key={step.key} className="contents">
                            <div className="flex flex-1 min-w-0 justify-center">
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded-full transition duration-300 shrink-0 ring-2 ring-transparent',
                                        compact ? 'h-7 w-7' : 'h-9 w-9',
                                        isCompleted && 'bg-amber-500 text-white ring-amber-500/30 dark:ring-amber-500/20',
                                        isCurrent && step.key === 'PENDING_CLOSE' && 'bg-purple-500 text-white ring-4 ring-purple-500/30 dark:ring-purple-500/25 animate-pulse',
                                        isCurrent && step.key !== 'PENDING_CLOSE' && 'bg-amber-500 text-white ring-4 ring-amber-500/30 dark:ring-amber-500/25',
                                        !isCompleted && !isCurrent && 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500 ring-slate-200 dark:ring-white/20',
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className={cn('shrink-0', compact ? 'h-4 w-4' : 'h-5 w-5')} />
                                    ) : (
                                        <Circle className={cn('shrink-0', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} strokeWidth={2.5} />
                                    )}
                                </div>
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        'flex-1 min-w-[32px] max-w-[72px] h-1 rounded-full transition duration-500 mx-1',
                                        lineActive
                                            ? 'bg-amber-500 dark:bg-amber-500/90'
                                            : 'bg-slate-200 dark:bg-white/10',
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Row 2: labels — equal columns, min height, wrap support */}
            {!compact && (
                <div className="grid grid-cols-4 gap-2 mt-2 w-full">
                    {mainSteps.map((step) => {
                        const isCompleted = STATUS_ORDER[step.key] < currentOrder;
                        const isCurrent = step.key === currentStatus;
                        return (
                            <div
                                key={step.key}
                                className="flex flex-col items-center justify-start min-h-[2rem] min-w-0"
                            >
                                <span
                                    className={cn(
                                        'text-xs font-semibold text-center break-words line-clamp-2 leading-snug w-full',
                                        (isCompleted || isCurrent) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400',
                                    )}
                                    title={step.label}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
