import { useTranslation } from 'react-i18next';
import { Star, Clock, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroStatsProps {
  stats: {
    verified: string;
    projects: string;
    rating: string;
    support: string;
  };
  isDark: boolean;
}

const STAT_CARDS = [
  { valueKey: 'verified' as const, labelKey: 'statVerified' as const, icon: <Users size={18} />, colorClass: 'text-primary' },
  { valueKey: 'projects' as const, labelKey: 'statProjects' as const, icon: <CheckCircle size={18} />, colorClass: 'text-sky-600 dark:text-sky-400' },
  { valueKey: 'rating' as const, labelKey: 'statRating' as const, icon: <Star size={18} />, colorClass: 'text-sky-600 dark:text-sky-400' },
  { valueKey: 'support' as const, labelKey: 'statSupport' as const, icon: <Clock size={18} />, colorClass: 'text-emerald-600 dark:text-emerald-400' },
];

export function HeroStats({ stats, isDark }: HeroStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-10 sm:mt-14 md:mt-16 flex justify-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.labelKey}
            className={cn(
              'relative group px-6 py-5 rounded-2xl transition-all duration-300 overflow-hidden',
              isDark
                ? 'bg-white/[0.06] shadow-lg shadow-black/20'
                : 'bg-white/95 shadow-md shadow-black/5'
            )}
          >
            <div className="relative flex items-start gap-3">
              <div className={cn('mt-0.5 opacity-60', stat.colorClass)}>{stat.icon}</div>
              <div>
                <div className={cn('text-2xl font-black tabular-nums', stat.colorClass)}>
                  {stats[stat.valueKey]}
                </div>
                <div className="text-xs mt-0.5 text-muted-foreground">
                  {t(`home.${stat.labelKey}`)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
