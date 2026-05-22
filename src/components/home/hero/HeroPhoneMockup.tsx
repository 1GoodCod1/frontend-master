import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Droplets,
  Zap,
  Sparkles,
  Truck,
  Search,
  Phone,
  Star,
  Plus,
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for mouse coordinates tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for tilt transformations
  const springConfig = { damping: 28, stiffness: 180, mass: 0.7 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(relativeX);
    mouseY.set(relativeY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex justify-center lg:justify-end py-10 px-8 select-none"
      style={{ perspective: 1000 }}
    >
      {/* Background Decorative Neon Blurred Blobs */}
      <div className="absolute left-1/4 top-1/4 h-48 w-48 rounded-full bg-violet-500/15 blur-[60px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-[#E97525]/12 blur-[60px] pointer-events-none -z-10" />

      {/* Floating Micro-Badges (Parallax Particles) */}
      {/* 1. Rating Star Badge */}
      <motion.div
        style={{
          x: useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig),
          y: useSpring(useTransform(mouseY, [-0.5, 0.5], [-15, 15]), springConfig),
        }}
        className={cn(
          'absolute left-4 top-1/4 h-9 w-9 shadow-lg rounded-full flex items-center justify-center z-20 border animate-bounce',
          isDark ? 'bg-[#1b1b1b] border-white/10 text-amber-400' : 'bg-white border-gray-100 text-amber-500',
        )}
        style={{ animationDuration: '3s' }}
      >
        <Star size={15} className="fill-current" />
      </motion.div>

      {/* 2. Active User Avatar */}
      <motion.div
        style={{
          x: useSpring(useTransform(mouseX, [-0.5, 0.5], [12, -12]), springConfig),
          y: useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig),
        }}
        className={cn(
          'absolute -right-2 top-[45%] h-10 w-10 shadow-lg rounded-full flex items-center justify-center z-20 border font-bold text-[10px] animate-bounce',
          isDark ? 'bg-[#1b1b1b]/90 border-white/10 text-[#E97525]' : 'bg-white border-gray-100 text-[#c45f1a]',
        )}
        style={{ animationDuration: '4s' }}
      >
        <span>AM</span>
        <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
      </motion.div>

      {/* 3. New Order Badge */}
      <motion.div
        style={{
          x: useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig),
          y: useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig),
        }}
        className={cn(
          'absolute left-8 bottom-[20%] px-2.5 py-1.5 shadow-lg rounded-xl flex items-center gap-1.5 z-20 border text-[9px] font-bold text-[#E97525] animate-bounce',
          isDark ? 'bg-[#1b1b1b]/95 border-[#E97525]/25' : 'bg-white border-[#E97525]/20',
        )}
        style={{ animationDuration: '5s' }}
      >
        <Plus size={10} strokeWidth={3} />
        <span>Job</span>
      </motion.div>

      {/* Tilted 3D Phone Wrapper */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative w-[min(100%,280px)] sm:w-[290px] rounded-[2.6rem] p-2.5 shadow-2xl transition-all duration-300',
          isDark ? 'bg-[#0d0d0d] shadow-black/60 border border-white/5' : 'bg-[#111111] shadow-black/30',
        )}
        aria-hidden
      >
        <div
          className={cn(
            'rounded-[2.1rem] overflow-hidden border',
            isDark ? 'bg-[#141414] border-white/[0.08]' : 'bg-white border-white/10',
          )}
        >
          <div className="px-4 pt-4 pb-3 space-y-3">
            {/* Phone Header - Categories */}
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

            {/* Phone Search */}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-xs',
                isDark ? 'bg-white/[0.06] text-white/40' : 'bg-gray-100 text-gray-400',
              )}
            >
              <Search size={14} className="shrink-0" />
              <span>{t('home.heroPhoneSearch')}</span>
            </div>

            {/* Phone Master Card */}
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
                  'mt-2.5 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#E97525]/10 to-[#E97525]/5 p-2',
                )}
              >
                <div className="w-full h-full rounded border border-[#E97525]/15 border-dashed flex items-center justify-center text-[8px] text-[#E97525] font-semibold tracking-wider uppercase">
                  Portofoliu Lucrări
                </div>
              </div>
              <button
                type="button"
                tabIndex={-1}
                className={cn(
                  'mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]',
                  isDark ? 'bg-white text-[#111]' : 'bg-slate-900 text-white',
                )}
              >
                <Phone size={12} />
                {t('home.heroPhoneContact')}
              </button>
            </div>

            {/* Phone Live Status */}
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

            {/* Phone Reviews */}
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
      </motion.div>
    </div>
  );
}
