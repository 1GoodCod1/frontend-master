import {
  User,
  Phone,
  Clock,
  MessageSquare,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeadStatusProgress } from './LeadStatusProgress';
import { formatDateTimeString } from '@/utils/date';
import { LEAD_STATUS_OPTIONS, type LeadStatus, type LeadDto } from '@/types/leads';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

function statusLabel(status: string | null | undefined, t: (key: string) => string): string {
  const s = (status ?? 'NEW').toUpperCase();
  if (s === 'NEW') return t('leads.new');
  if (s === 'IN_PROGRESS') return t('leads.in_progress');
  if (s === 'CLOSED') return t('leads.closed');
  if (s === 'SPAM') return t('leads.spam');
  return t('leads.new');
}

const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string) => (
  <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-4 py-3 sm:px-6 sm:py-5">
    <div className="rounded-lg bg-amber-500/10 p-1.5 sm:p-2 text-amber-600 dark:text-amber-500 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">{title}</h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{subtitle}</p>
    </div>
  </div>
);

type LeadCardProps = {
  lead: LeadDto & { clientName?: string; clientPhone?: string; createdAt?: string; message?: string; status?: string };
  locale: string;
  isUpdating?: boolean;
  onStatusChange?: (lead: { id: string; encodedId?: string | null }, status: LeadStatus) => void;
  onOpenDetails?: (lead: { id: string; encodedId?: string | null }) => void;
  variant?: 'list' | 'detail';
};

export function LeadCard({
  lead,
  locale,
  isUpdating = false,
  onStatusChange,
  onOpenDetails,
  variant = 'list',
}: LeadCardProps) {
  const { t } = useTranslation();
  const isClosed = lead?.status === 'CLOSED' || lead?.status === 'SPAM';
  const clientName = lead?.clientName || t('leads.client');

  const cardClass = cn(
    'overflow-hidden transition-all duration-300',
    'rounded-xl border border-slate-200 dark:border-white/[0.08]',
    'bg-white dark:bg-black/40 dark:backdrop-blur-xl',
    'shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none',
    'hover:border-amber-500/30 dark:hover:border-amber-500/30',
    isClosed && 'opacity-80'
  );

  return (
    <Card className={cardClass}>
      {sectionHeader(
        <User className="size-5" />,
        t('leads.client'),
        t('leads.contactDetails')
      )}
      <CardContent className="space-y-4 sm:space-y-5 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1 sm:mb-2 break-words">
              {String(clientName)}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">
              {lead?.clientPhone && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <Phone className="size-4 opacity-70 shrink-0" />
                  <span className="truncate">{String(lead.clientPhone)}</span>
                </span>
              )}
              {lead?.createdAt && (
                <span className="flex items-center gap-1.5 shrink-0">
                  <Clock className="size-4 opacity-70" />
                  {formatDateTimeString(lead.createdAt, locale)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {variant === 'detail' && (
              <div className="pt-2 max-w-sm w-full sm:w-auto">
                <LeadStatusProgress status={lead?.status as string} />
              </div>
            )}
            {variant === 'list' ? (
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 pt-1">
                {statusLabel(lead?.status as string, t)}
              </p>
            ) : (
              <Select
                value={(lead?.status as LeadStatus) ?? 'NEW'}
                onValueChange={(v) => onStatusChange?.(lead, v as LeadStatus)}
                disabled={isUpdating || isClosed}
              >
                <SelectTrigger className="w-full sm:w-[140px] rounded-xl border-slate-200 dark:border-white/[0.12] bg-white dark:bg-black/40 h-11">
                  <SelectValue placeholder={t('leads.setStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS_OPTIONS.filter((s) => s !== 'SPAM').map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`leads.${s.toLowerCase()}` as 'leads.new' | 'leads.in_progress' | 'leads.closed' | 'leads.spam')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {lead?.message && variant === 'detail' && (
          <div className="rounded-xl border border-slate-100 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-sm font-semibold text-foreground">{t('leads.message')}</p>
            </div>
            <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-700 dark:text-slate-300 text-lg">
              {String(lead.message)}
            </p>
          </div>
        )}

        {lead?.id && (
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 pt-1">
            {onOpenDetails && (
              <Button
                size="sm"
                onClick={() => onOpenDetails(lead)}
                className="h-10 sm:h-8 gap-1.5 border-0 bg-amber-600 text-white text-sm hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation"
              >
                <ExternalLink className="size-3.5" />
                {t('leads.open')}
              </Button>
            )}
            {variant === 'detail' && !isClosed && onStatusChange && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (window.confirm(t('leads.confirmSpam'))) {
                    onStatusChange(lead, 'SPAM');
                  }
                }}
                className="h-8 gap-1.5 px-3 text-sm text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              >
                <AlertCircle className="size-3.5" />
                {t('leads.markAsSpam')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
