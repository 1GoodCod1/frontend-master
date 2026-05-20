import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

interface PublicJobsSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export function PublicJobsSearch({ value, onChange }: PublicJobsSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl px-4 py-4">
      <div className={cn('flex items-center gap-2.5 rounded-xl px-4 py-2.5 focus-within:border-primary/50 transition-colors', surfaceCardCls)}>
        <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('jobs.searchPlaceholder', 'Search jobs…')}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/45"
        />
        {value && (
          <button onClick={() => onChange('')} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
