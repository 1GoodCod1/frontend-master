import { useTranslation } from 'react-i18next';
import { Crown, TrendingUp, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MasterCardBadgesProps {
  isPlus: boolean;
  isPro: boolean;
  /** Секция «Новые» на главной */
  sectionBadge?: 'new';
  /** Бейдж «Топ» по скору популярности (API: topMaster) */
  showTopBadge?: boolean;
}

const topBadgeTooltipClass =
  'rounded-md px-2 py-1 text-xs bg-[hsl(var(--popover))] text-popover-foreground border-0 shadow-sm dark:shadow-black/40';

export function MasterCardBadges({
  isPlus,
  isPro,
  sectionBadge,
  showTopBadge,
}: MasterCardBadgesProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0">
      {isPro && (
        <div className="flex items-center gap-0.5">
          <Crown size={8} className="min-[480px]:w-[10px] min-[480px]:h-[10px] sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#0d9488' }} />
          <span className="text-[8px] min-[480px]:text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#0d9488' }}>
            {t('common.masterCard.pro')}
          </span>
        </div>
      )}
      {isPlus && !isPro && (
        <div className="flex items-center gap-0.5">
          <Crown size={8} className="min-[480px]:w-[10px] min-[480px]:h-[10px] sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#8b5cf6' }} />
          <span className="text-[8px] min-[480px]:text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#8b5cf6' }}>
            {t('common.masterCard.plus')}
          </span>
        </div>
      )}
      {showTopBadge && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-0.5 cursor-default">
                <TrendingUp size={8} className="min-[480px]:w-[10px] min-[480px]:h-[10px] sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#f59e0b' }} />
                <span className="text-[8px] min-[480px]:text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#f59e0b' }}>
                  {t('common.masterCard.top')}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className={topBadgeTooltipClass}>
              {t('common.masterCard.topTooltip')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {sectionBadge === 'new' && (
        <div className="flex items-center gap-0.5">
          <Sparkles size={8} className="min-[480px]:w-[10px] min-[480px]:h-[10px] sm:w-[11px] sm:h-[11px] shrink-0" style={{ color: '#a78bfa' }} />
          <span className="text-[8px] min-[480px]:text-[10px] sm:text-[11px] font-semibold tracking-wide" style={{ color: '#a78bfa' }}>
            {t('common.masterCard.new')}
          </span>
        </div>
      )}
    </div>
  );
}
