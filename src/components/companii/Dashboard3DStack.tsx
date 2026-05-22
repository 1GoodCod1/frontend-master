import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users,
  MapPin,
  TrendingUp,
  Activity,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Dashboard3DStack() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for tracking mouse offsets
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth physics-based spring options for rotation
  const springConfig = { damping: 25, stiffness: 220, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

  // Slight horizontal and vertical shift based on cursor
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    // Calculate normalized relative coordinates from -0.5 to 0.5
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(relativeX);
    mouseY.set(relativeY);
  };

  const handleMouseLeave = () => {
    // Smooth return to center
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex h-[400px] w-full max-w-[420px] items-center justify-center cursor-default select-none"
      style={{ perspective: 1200 }}
    >
      {/* 3D Floating container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full w-full"
      >
        {/* Layer 1: BACK CARD - Team & Staff Panel */}
        <motion.div
          style={{
            transform: 'translateZ(-40px) rotateZ(-6deg)',
            backfaceVisibility: 'hidden',
          }}
          className={cn(
            'absolute left-4 top-8 w-[250px] rounded-[20px] p-4 shadow-xl transition-all duration-300',
            'border border-gray-200/50 bg-white/70 backdrop-blur-xl',
            'dark:border-white/10 dark:bg-black/60',
          )}
        >
          <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#8B5CF6]/15 text-[#8B5CF6]">
                <Users size={13} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-bold text-gray-800 dark:text-white/90">
                {t('companii.dashboard.teamTitle', { defaultValue: 'Echipa Ta' })}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              3 {t('companii.dashboard.online', { defaultValue: 'activi' })}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Team Member 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5CF6] text-[10px] font-bold text-white">
                  IS
                </div>
                <div className="leading-none">
                  <p className="text-[11px] font-semibold text-gray-800 dark:text-white/90">Ion S.</p>
                  <p className="text-[9px] text-gray-500 dark:text-white/40">
                    {t('companii.dashboard.plumber', { defaultValue: 'Instalator' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-[#8B5CF6]">
                <ShieldCheck size={11} />
                <span>9.8</span>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981] text-[10px] font-bold text-white">
                  AM
                </div>
                <div className="leading-none">
                  <p className="text-[11px] font-semibold text-gray-800 dark:text-white/90">Andrei M.</p>
                  <p className="text-[9px] text-gray-500 dark:text-white/40">
                    {t('companii.dashboard.electrician', { defaultValue: 'Electrician' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-[#10B981]">
                <Check size={11} />
                <span>9.5</span>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F59E0B] text-[10px] font-bold text-white">
                  EV
                </div>
                <div className="leading-none">
                  <p className="text-[11px] font-semibold text-gray-800 dark:text-white/90">Elena V.</p>
                  <p className="text-[9px] text-gray-500 dark:text-white/40">
                    {t('companii.dashboard.dispatcher', { defaultValue: 'Dispecer' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-[#F59E0B]">
                <Activity size={11} />
                <span>10.0</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Layer 2: MIDDLE CARD - Live Request Notification */}
        <motion.div
          style={{
            transform: 'translateZ(20px) rotateZ(4deg)',
            backfaceVisibility: 'hidden',
          }}
          className={cn(
            'absolute right-2 top-14 w-[240px] rounded-[20px] p-4 shadow-xl transition-all duration-300',
            'border border-gray-200/50 bg-white/80 backdrop-blur-xl',
            'dark:border-white/10 dark:bg-black/60',
          )}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8B5CF6]">
              <Sparkles size={8} />
              {t('companii.dashboard.newRequest', { defaultValue: 'Cerere Nouă' })}
            </span>
            <span className="text-[9px] text-gray-400 dark:text-white/30">Just Now</span>
          </div>

          <h4 className="text-[12px] font-bold text-gray-900 dark:text-white">
            {t('companii.dashboard.reqTitle', { defaultValue: 'Reparație Boiler Termoelectric' })}
          </h4>

          <div className="mt-2.5 space-y-1.5 border-t border-gray-100 pt-2 text-[10px] dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-white/60">
              <MapPin size={11} className="text-[#8B5CF6]" />
              <span>Chişinău, str. Ştefan cel Mare</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-white/60">
              <Clock size={11} className="text-amber-500" />
              <span>
                {t('companii.dashboard.reqTime', { defaultValue: 'Azi, 14:00 - 16:00' })}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-white/[0.06]">
            <span className="text-xs font-black text-gray-900 dark:text-white">750 MDL</span>
            <div className="flex gap-1.5">
              <button className="rounded-lg bg-gray-100 px-2.5 py-1 text-[9px] font-bold text-gray-700 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1]">
                {t('companii.dashboard.decline', { defaultValue: 'Refuză' })}
              </button>
              <button className="rounded-lg bg-[#8B5CF6] px-2.5 py-1 text-[9px] font-bold text-white hover:bg-[#7c4fe0]">
                {t('companii.dashboard.accept', { defaultValue: 'Acceptă' })}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Layer 3: FRONT CARD - Analytics Area Chart */}
        <motion.div
          style={{
            transform: 'translateZ(70px) rotateZ(-2deg)',
            backfaceVisibility: 'hidden',
          }}
          className={cn(
            'absolute bottom-6 left-10 w-[270px] rounded-[22px] p-4.5 shadow-2xl transition-all duration-300',
            'border border-violet-500/20 bg-white/90 backdrop-blur-xl dark:border-violet-500/25 dark:bg-black/75',
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-white/40">
                {t('companii.dashboard.revenueKicker', { defaultValue: 'Venituri Săptămânale' })}
              </p>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                18,420 MDL
              </h3>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={11} strokeWidth={2.5} />
              <span>+14.8%</span>
            </div>
          </div>

          {/* Smooth SVG Area Line Chart */}
          <div className="relative mt-2 h-16 w-full">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area path */}
              <path
                d="M 0 50 Q 30 35, 60 45 T 120 15 T 180 25 T 200 5 L 200 60 L 0 60 Z"
                fill="url(#chartGradient)"
              />

              {/* Line path */}
              <path
                d="M 0 50 Q 30 35, 60 45 T 120 15 T 180 25 T 200 5"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Glowing active point */}
              <circle cx="120" cy="15" r="4" fill="#8B5CF6" />
              <circle
                cx="120"
                cy="15"
                r="8"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="1.5"
                className="animate-ping"
                style={{ transformOrigin: '120px 15px' }}
              />
            </svg>
          </div>

          <div className="mt-3 flex items-center justify-between text-[8px] font-medium text-gray-400 dark:text-white/20">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mie</span>
            <span>Joi</span>
            <span>Vin</span>
            <span>Sâm</span>
            <span>Dum</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
