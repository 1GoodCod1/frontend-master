import { useTranslation } from 'react-i18next';
import { Shield, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const BADGES = [
  { icon: <Shield size={14} />, textKey: 'heroTrustBadge1' as const },
  { icon: <Zap size={14} />, textKey: 'heroTrustBadge2' as const },
  { icon: <Star size={14} />, textKey: 'heroTrustBadge3' as const },
];

interface HeroTrustBadgesProps {
  isDark: boolean;
}

export function HeroTrustBadges({ isDark }: HeroTrustBadgesProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0 rounded-xl px-4 py-3 transition-all duration-500',
        isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white/50 border border-gray-200/60'
      )}
    >
      {BADGES.map((b, idx) => (
        <div key={b.textKey} className="flex items-center shrink-0">
          {idx > 0 && (
            <div
              className="w-px h-5 mx-3 shrink-0"
              style={{
                background: isDark
                  ? 'linear-gradient(to bottom, transparent, rgba(233,117,37,0.4), transparent)'
                  : 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.12), transparent)',
              }}
            />
          )}
          <div
            className={cn(
              'flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors',
              'text-xs font-medium',
              isDark ? 'text-white/80' : 'text-slate-600'
            )}
          >
            <span className={isDark ? 'text-[#E97525]' : 'text-primary'}>{b.icon}</span>
            {t(`home.${b.textKey}`)}
          </div>
        </div>
      ))}
    </div>
  );
}
