import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type PublicJobsTab = 'best' | 'recent' | 'saved';

interface PublicJobsTabsProps {
  activeTab: PublicJobsTab;
  onTabChange: (tab: PublicJobsTab) => void;
  savedCount: number;
  total?: number;
  isLoading?: boolean;
  isMaster?: boolean;
}

export function PublicJobsTabs({
  activeTab,
  onTabChange,
  savedCount,
  total,
  isLoading,
  isMaster,
}: PublicJobsTabsProps) {
  const { t } = useTranslation();

  const tabs: { key: PublicJobsTab; label: string; masterOnly?: boolean }[] = [
    { key: 'best', label: t('jobs.tabBestMatches'), masterOnly: true },
    { key: 'recent', label: t('jobs.tabMostRecent') },
    {
      key: 'saved',
      label:
        savedCount > 0
          ? `${t('jobs.tabSaved')} (${savedCount})`
          : t('jobs.tabSaved'),
    },
  ];

  const visibleTabs = tabs.filter((item) => !item.masterOnly || isMaster);

  return (
    <div className="w-full max-w-4xl px-4 border-b border-[#E9ECEF] dark:border-white/[0.08]">
      <div className="flex items-end">
        {visibleTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onTabChange(item.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium relative transition-colors duration-200',
              'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:transition-colors',
              activeTab === item.key
                ? 'text-[#212529] dark:text-white after:bg-[#E97525]'
                : 'text-[#868E96] dark:text-white/45 hover:text-[#212529] dark:hover:text-white/80 after:bg-transparent',
            )}
          >
            {item.label}
          </button>
        ))}
        <span className="ml-auto self-center pb-2.5 text-xs text-[#868E96] dark:text-white/40 tabular-nums">
          {!isLoading && total !== undefined && total > 0
            ? `${total} ${t('jobs.jobsCount')}`
            : null}
        </span>
      </div>
      {isMaster && activeTab === 'best' ? (
        <p className="pb-2 text-[11px] text-[#6C757D] dark:text-white/50 leading-relaxed">
          {t('jobs.tabBestMatchesHint')}
        </p>
      ) : null}
    </div>
  );
}
