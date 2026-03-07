import type { CreatedAtCellProps } from '@/types/admin';
import { formatDateTime } from '@/utils/date';

export type { CreatedAtCellProps };

const DEFAULT_LOCALE = 'ru-RU';

export default function CreatedAtCell({ createdAt, locale = DEFAULT_LOCALE }: CreatedAtCellProps) {
  if (!createdAt) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const { dateStr, timeStr } = formatDateTime(createdAt, locale);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-foreground">{dateStr}</span>
      <span className="text-xs text-muted-foreground">{timeStr}</span>
    </div>
  );
}
