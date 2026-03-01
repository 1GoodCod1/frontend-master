import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'SPAM';

interface LeadStatusProgressProps {
    status: LeadStatus | string | null | undefined;
    className?: string;
    compact?: boolean;
}

const MAIN_STEPS: { key: LeadStatus; label: string }[] = [
    { key: 'NEW', label: 'Новая' },
    { key: 'IN_PROGRESS', label: 'В работе' },
    { key: 'CLOSED', label: 'Закрыта' },
];

const STATUS_ORDER: Record<LeadStatus, number> = {
    NEW: 0,
    IN_PROGRESS: 1,
    CLOSED: 2,
    SPAM: -1,
};

export function LeadStatusProgress({ status, className, compact = false }: LeadStatusProgressProps) {
    const currentStatus = (status ?? 'NEW') as LeadStatus;
    const isSpam = currentStatus === 'SPAM';
    const currentOrder = STATUS_ORDER[currentStatus] ?? 0;

    if (isSpam) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Спам
                </div>
            </div>
        );
    }

    return (
        <div className={cn('w-full', className)}>
            <div className="flex items-center w-full gap-0">
                {MAIN_STEPS.map((step, idx) => {
                    const isCompleted = STATUS_ORDER[step.key] < currentOrder;
                    const isCurrent = step.key === currentStatus;
                    const isLast = idx === MAIN_STEPS.length - 1;

                    return (
                        <div key={step.key} className="flex items-center flex-1 min-w-0">
                            {/* Step dot + label */}
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded-full transition-all duration-300',
                                        compact ? 'h-6 w-6' : 'h-8 w-8',
                                        isCompleted && 'bg-amber-500 text-white shadow-sm shadow-amber-400/50',
                                        isCurrent && 'bg-amber-500 text-white shadow-md shadow-amber-400/50 ring-4 ring-amber-500/20',
                                        !isCompleted && !isCurrent && 'bg-muted text-muted-foreground border-2 border-border',
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className={cn('shrink-0', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
                                    ) : (
                                        <Circle className={cn('shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
                                    )}
                                </div>
                                {!compact && (
                                    <span
                                        className={cn(
                                            'text-[11px] font-semibold whitespace-nowrap',
                                            (isCompleted || isCurrent) ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                )}
                            </div>

                            {/* Connector line */}
                            {!isLast && (
                                <div className={cn(
                                    'flex-1 transition-all duration-500',
                                    compact ? 'h-0.5 mx-1' : 'h-1 mx-2 rounded-full',
                                    isCompleted || (isCurrent && idx < currentOrder)
                                        ? 'bg-amber-500'
                                        : 'bg-border dark:bg-white/[0.1]',
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
