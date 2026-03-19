import { useTranslation } from 'react-i18next';
import { Crown, TrendingUp, Sparkles } from 'lucide-react';

interface MasterCardBadgesProps {
  isVip: boolean;
  isPremium: boolean;
  sectionBadge?: 'popular' | 'new';
}

export function MasterCardBadges({ isVip, isPremium, sectionBadge }: MasterCardBadgesProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0">
      {isPremium && (
        <div className="flex items-center gap-0.5">
          <Crown size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#0d9488' }} />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#0d9488' }}>
            {t('common.masterCard.premium')}
          </span>
        </div>
      )}
      {isVip && !isPremium && (
        <div className="flex items-center gap-0.5">
          <Crown size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#8b5cf6' }} />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#8b5cf6' }}>
            {t('common.masterCard.vip')}
          </span>
        </div>
      )}
      {sectionBadge === 'popular' && (
        <div className="flex items-center gap-0.5">
          <TrendingUp size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#f59e0b' }} />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#f59e0b' }}>
            {t('common.masterCard.top')}
          </span>
        </div>
      )}
      {sectionBadge === 'new' && (
        <div className="flex items-center gap-0.5">
          <Sparkles size={10} className="sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#a78bfa' }} />
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#a78bfa' }}>
            {t('common.masterCard.new')}
          </span>
        </div>
      )}
    </div>
  );
}
