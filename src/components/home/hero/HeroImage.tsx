import { useTranslation } from 'react-i18next';
import { Shield, Zap } from 'lucide-react';
import OptimizedImage from '@/components/common/OptimizedImage';
import { cn } from '@/lib/utils';

interface HeroImageProps {
  isDark: boolean;
  onlineMastersCount?: number;
}

export function HeroImage({ isDark, onlineMastersCount }: HeroImageProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex items-center justify-center order-first lg:order-none mt-6 sm:mt-8 lg:mt-16">
      <div
        className="absolute inset-0 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] blur-2xl sm:blur-3xl transition duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse, hsl(var(--primary)/0.08), transparent 70%)'
            : 'radial-gradient(ellipse, hsl(var(--primary)/0.06), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-[340px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-lg">
        {/* Main card */}
        <div
          className={cn(
            'relative rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border overflow-hidden transition duration-500',
            isDark
              ? 'bg-[#1a1a1a] border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.4)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
              : 'bg-card border-gray-200 shadow-lg shadow-black/5'
          )}
        >
          {/* Card top bar */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 py-2 sm:py-3 transition duration-500">
            <div className="flex gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500" />
            </div>
            <div
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs transition duration-500',
                isDark ? 'bg-white/5 text-white/40' : 'bg-primary/10 text-foreground/80'
              )}
            >
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-none">{t('home.heroSpecialistsAvailable')}</span>
            </div>
            <div className={cn('text-[10px] sm:text-xs shrink-0', 'text-muted-foreground')}>
              Faber
            </div>
          </div>

          {/* Image area */}
          <div
            className={cn(
              'relative h-48 sm:h-64 md:h-72 lg:h-80 xl:h-[22rem] transition duration-500',
              isDark ? 'bg-[#1a1a1a]' : 'bg-muted/50'
            )}
          >
            <OptimizedImage
              basePath="/images/hero-masters-universal"
              alt=""
              className="w-full h-full object-contain object-bottom transition-opacity duration-500"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              draggable={false}
            />
            <div
              className="absolute inset-0 transition duration-500"
              style={{
                background: isDark
                  ? 'linear-gradient(to top, #1a1a1a 10%, transparent 60%)'
                  : 'linear-gradient(to top, rgba(248,250,252,0.6) 0%, transparent 40%)',
              }}
            />
            {/* Floating badge */}
            <div
              className={cn(
                'absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-md transition duration-500',
                isDark ? 'bg-[#1a1a1a]/90' : 'bg-card/90'
              )}
            >
              <div className="flex -space-x-0.5 sm:-space-x-1">
                {['bg-blue-400', 'bg-green-400', 'bg-sky-400'].map((c, i) => (
                  <div
                    key={i}
                    className={cn(`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full ${c}`)}
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-foreground">
                +{onlineMastersCount ?? 120} activi
              </span>
            </div>
          </div>
        </div>

        {/* Floating stat cards — visible from md */}
        <div
          className={cn(
            'absolute -left-2 sm:-left-4 lg:-left-8 top-12 sm:top-16 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl hidden md:block transition duration-500',
            isDark ? 'bg-[#1a1a1a] border border-white/[0.06] shadow-lg shadow-black/30' : 'bg-white/95 shadow-md shadow-black/5'
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-primary bg-primary/12 shrink-0">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-foreground truncate">{t('home.heroVerified100')}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">{t('home.heroVerifiedDesc')}</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'absolute -right-2 sm:-right-4 lg:-right-6 bottom-4 sm:bottom-6 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl hidden md:block transition duration-500',
            isDark ? 'bg-[#1a1a1a] border border-white/[0.06] shadow-lg shadow-black/30' : 'bg-white/95 shadow-md shadow-black/5'
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-sky-500 bg-sky-500/12 shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-foreground truncate">{t('home.heroResponseTime')}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">{t('home.heroResponseDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
