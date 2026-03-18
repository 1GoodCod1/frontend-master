import { useTranslation } from 'react-i18next';
import { useIsDark } from '@/hooks/useIsDark';
import { getLeadStatusColor, getLeadStatusBgColor } from '@/utils/statusColors';
import { cn } from '@/lib/utils';

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

/** Shared lead status badge with theme-aware colors. */
export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const normalized = String(status ?? 'NEW').toUpperCase();
  const statusColor = getLeadStatusColor(normalized, isDark);
  const statusBgColor = getLeadStatusBgColor(normalized, isDark);

  return (
    <span
      className={cn('rounded-md border px-2 py-0.5 text-xs font-semibold', className)}
      style={{
        backgroundColor: statusBgColor,
        color: statusColor,
        borderColor: statusColor,
      }}
    >
      {t(`leads.${normalized.toLowerCase()}`)}
    </span>
  );
}
