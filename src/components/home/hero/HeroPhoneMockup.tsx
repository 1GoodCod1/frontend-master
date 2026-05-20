import { useTranslation } from 'react-i18next';
import {
  Droplets,
  Zap,
  Sparkles,
  Truck,
  Search,
  Phone,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PHONE_CATEGORIES = [
  { icon: Droplets, active: false, color: 'text-sky-500' },
  { icon: Zap, active: true, color: 'text-[#E97525]' },
  { icon: Sparkles, active: false, color: 'text-muted-foreground' },
  { icon: Truck, active: false, color: 'text-muted-foreground' },
] as const;

interface HeroPhoneMockupProps {
  isDark: boolean;
}

export function HeroPhoneMockup({ isDark }: HeroPhoneMockupProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex justify-center lg:justify-end">
      <div
        className={cn(
          'relative w-[min(100%,280px)] sm:w-[300px] rounded-[2.5rem] p-2.5 shadow-2xl',
          isDark ? 'bg-[#0d0d0d] shadow-black/50' : 'bg-[#111111] shadow-black/25',
        )}
        aria-hidden
      >
        <div
          className={cn(
            'rounded-[2rem] overflow-hidden border',
            isDark ? 'bg-[#141414] border-white/[0.08]' : 'bg-white border-white/10',
          )}
        >
          <div className="px-4 pt-4 pb-3 space-y-3">
            <div className="flex gap-2 justify-center">
              {PHONE_CATEGORIES.map(({ icon: Icon, active, color }, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border transition-colors',
                    active
                      ? 'border-[#E97525]/50 bg-[#E97525]/10'
                      : isDark
                        ? 'border-white/[0.08] bg-white/[0.04]'
                        : 'border-gray-200 bg-gray-50',
                  )}
                >
                  <Icon size={16} className={cn(active ? 'text-[#E97525]' : color)} strokeWidth={2} />
                </div>
              ))}
            </div>

            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs',
                isDark ? 'bg-white/[0.06] text-white/40' : 'bg-gray-100 text-gray-400',
              )}
            >
              <Search size={14} className="shrink-0" />
              <span>{t('home.heroPhoneSearch')}</span>
            </div>

            <div
              className={cn(
                'rounded-2xl p-3 border',
                isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white border-gray-100 shadow-sm',
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E97525]/15 flex items-center justify-center text-[11px] font-bold text-[#E97525] shrink-0">
                  AM
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-xs font-semibold truncate', isDark ? 'text-white' : 'text-slate-900')}>
                    {t('home.heroPhoneMasterName')}
                  </p>
                  <p className={cn('text-[10px] truncate', isDark ? 'text-white/45' : 'text-slate-500')}>
                    {t('home.heroPhoneMasterRole')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-500">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>
              <div
                className={cn(
                  'mt-2.5 h-14 rounded-lg',
                  isDark ? 'bg-white/[0.06]' : 'bg-gray-100',
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                className={cn(
                  'mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold',
                  isDark ? 'bg-white/90 text-[#111]' : 'bg-slate-900 text-white',
                )}
              >
                <Phone size={12} />
                {t('home.heroPhoneContact')}
              </button>
            </div>

            <div
              className={cn(
                'rounded-xl px-3 py-2.5 border',
                isDark
                  ? 'bg-[#E97525]/10 border-[#E97525]/20'
                  : 'bg-[#E97525]/08 border-[#E97525]/15',
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E97525] animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#E97525]">Live</span>
              </div>
              <p className={cn('text-[11px] font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                {t('home.heroPhoneLiveTitle')}
              </p>
              <p className={cn('text-[10px] mt-0.5', isDark ? 'text-white/45' : 'text-slate-500')}>
                {t('home.heroPhoneLiveMeta')}
              </p>
              <p className="text-[11px] font-bold text-[#E97525] mt-1">{t('home.heroPhoneLivePrice')}</p>
            </div>

            <div
              className={cn(
                'rounded-xl px-3 py-2 border text-[10px] leading-snug',
                isDark ? 'bg-white/[0.04] border-white/[0.06] text-white/70' : 'bg-gray-50 border-gray-100 text-slate-600',
              )}
            >
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={9} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              {t('home.heroPhoneReview')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
