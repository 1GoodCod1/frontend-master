import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FilterStatus, STATUS_OPTIONS } from '@/hooks/client/leads/useClientLeads';

interface LeadsStatusFilterProps {
  status: FilterStatus;
  onChange: (status: FilterStatus) => void;
}

export default function LeadsStatusFilter({ status, onChange }: LeadsStatusFilterProps) {
  const { t } = useTranslation();

  const options: { value: FilterStatus; label: string }[] = [
    { value: 'ALL', label: t('common.all') },
    ...STATUS_OPTIONS.map((s) => ({ value: s as FilterStatus, label: t(`leads.${s.toLowerCase()}`) })),
  ];

  return (
    <div className="mb-6 flex items-center gap-2">
      <Label htmlFor="status-filter" className="sr-only">
        {t('clientDashboard.filterByStatus')}
      </Label>
      <Filter className="size-4 shrink-0 text-amber-600 dark:text-amber-500" />
      <Select value={status} onValueChange={(v) => onChange(v as FilterStatus)}>
        <SelectTrigger id="status-filter" className="min-w-[200px]">
          <SelectValue placeholder={t('clientDashboard.filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
