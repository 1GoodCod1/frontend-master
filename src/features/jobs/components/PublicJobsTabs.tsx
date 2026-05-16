import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type PublicJobsTab = 'best' | 'recent' | 'saved';

interface PublicJobsTabsProps {
  activeTab: PublicJobsTab;
  onTabChange: (tab: PublicJobsTab) => void;
  savedCount: number;
  total?: number;
  isLoading?: boolean;
}

export function PublicJobsTabs({ activeTab, onTabChange, savedCount, total, isLoading }: PublicJobsTabsProps) {
  const { t } = useTranslation();

  const tabs = [
    { key: 'best' as const, label: t('jobs.tabBestMatches', 'Best Matches') },
    { key: 'recent' as const, label: t('jobs.tabMostRecent', 'Most Recent') },
    { key: 'saved' as const, label: savedCount > 0 ? `${t('jobs.tabSaved', 'Saved')} (${savedCount})` : t('jobs.tabSaved', 'Saved') },
  ];

  return (
    <div className="w-full max-w-4xl flex items-end px-4">
      {tabs.map((item) => (
        <button
          key={item.key}
          onClick={() => onTabChange(item.key)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium relative transition-all after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:transition-all',
            activeTab === item.key
              ? 'text-foreground after:bg-primary'
              : 'text-muted-foreground hover:text-foreground after:bg-transparent',
          )}
        >
          {item.label}
        </button>
      ))}
      <span className="ml-auto self-center pb-2.5 pr-1 text-xs text-muted-foreground/50">
        {!isLoading && total !== undefined && total > 0 && `${total} ${t('jobs.jobsCount', 'jobs')}`}
      </span>
    </div>
  );
}
