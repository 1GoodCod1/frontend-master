import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building2, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHead } from '@/components/home/SectionHead';
import { FeatureBentoCard } from '@/components/companii/FeatureBentoCard';
import { COMPANII_SECTION_ACCENT } from '@/constants/home';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';

function SoonTrailing() {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/12 dark:text-violet-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
      {t('home.companii.statusSoon')}
    </span>
  );
}

export function CompaniiTeaserSection() {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <SectionHead
        kicker={t('home.companii.kicker')}
        title={t('home.companii.title')}
        accent={COMPANII_SECTION_ACCENT}
        trailing={<SoonTrailing />}
        link={{ label: t('home.companii.ctaLearn'), href: paths.companii }}
      />

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Bento Card 1: Company Profile Admin (col-span-2) */}
        <FeatureBentoCard className="sm:col-span-2 p-6 min-h-[220px] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start justify-between h-full">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-violet-500/10 text-[#8B5CF6] dark:bg-violet-500/12">
                  <Building2 size={20} strokeWidth={2} />
                </div>
                <span className="rounded-full bg-violet-500/10 text-violet-750 dark:bg-violet-500/12 dark:text-violet-400 px-2.5 py-0.5 text-[10px] font-semibold">
                  {t('companii.features.statusSoon', { defaultValue: 'În Curând' })}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
                  {t('companii.features.f1Title', { defaultValue: 'Cabinetul Companiei' })}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-white/60 max-w-md">
                  {t('companii.features.f1Desc', { defaultValue: 'Creează o pagină profesională pentru brandul tău, adaugă logo-ul, portofoliul și gestionează centralizat toate serviciile oferite.' })}
                </p>
              </div>
            </div>
            
            {/* Widget */}
            <div className="w-full sm:w-auto shrink-0 flex items-center justify-center select-none mt-2 sm:mt-0">
              <div className="flex flex-col gap-2.5 rounded-xl border border-gray-100/70 bg-white/[0.4] backdrop-blur-md p-3.5 text-[10px] dark:border-white/[0.06] dark:bg-white/[0.02] w-full sm:w-[220px] shadow-sm">
                <div className="flex items-center justify-between font-bold text-gray-700 dark:text-white/80 border-b border-gray-100 pb-1.5 dark:border-white/[0.04]">
                  <span>Faber Master SRL</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 dark:text-white/40">Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verificat
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 dark:text-white/40">Echipă:</span>
                  <span className="font-semibold text-gray-700 dark:text-white/80">8 Specialiști</span>
                </div>
                <div className="flex items-center -space-x-1.5 overflow-hidden mt-1.5">
                  <div className="inline-block h-5 w-5 rounded-full bg-violet-600 text-[8px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#1a1a1a]">IS</div>
                  <div className="inline-block h-5 w-5 rounded-full bg-emerald-600 text-[8px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#1a1a1a]">AM</div>
                  <div className="inline-block h-5 w-5 rounded-full bg-amber-600 text-[8px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#1a1a1a]">EV</div>
                  <div className="inline-block h-5 w-5 rounded-full bg-gray-400 text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#1a1a1a]">+5</div>
                </div>
              </div>
            </div>
          </div>
        </FeatureBentoCard>

        {/* Bento Card 2: Teams & Roles (col-span-1) */}
        <FeatureBentoCard className="sm:col-span-1 p-6 min-h-[220px] flex flex-col justify-between">
          <div className="flex flex-col gap-4 justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-sky-500/10 text-sky-500 dark:bg-sky-500/12">
                  <Users size={20} strokeWidth={2} />
                </div>
                <span className="rounded-full bg-violet-500/10 text-violet-750 dark:bg-violet-500/12 dark:text-violet-400 px-2.5 py-0.5 text-[10px] font-semibold">
                  {t('companii.features.statusSoon', { defaultValue: 'În Curând' })}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
                  {t('companii.features.f2Title', { defaultValue: 'Echipă și Roluri' })}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-white/60">
                  {t('companii.features.f2Desc', { defaultValue: 'Adaugă meșteri în echipa ta, atribuie roluri (Dispecer, Specialist) și monitorizează performanța fiecărui membru.' })}
                </p>
              </div>
            </div>

            {/* Micro-visual at the bottom */}
            <div className="w-full flex items-center justify-between border-t border-gray-100/70 pt-3 dark:border-white/[0.04] text-[9px] text-slate-400 select-none">
              <div className="flex -space-x-1 overflow-hidden">
                <div className="h-5 w-5 rounded-full bg-sky-650 flex items-center justify-center text-[7px] font-bold text-white ring-1 ring-white dark:ring-black">D</div>
                <div className="h-5 w-5 rounded-full bg-emerald-650 flex items-center justify-center text-[7px] font-bold text-white ring-1 ring-white dark:ring-black">M</div>
                <div className="h-5 w-5 rounded-full bg-amber-650 flex items-center justify-center text-[7px] font-bold text-white ring-1 ring-white dark:ring-black">S</div>
              </div>
              <span className="font-mono">Active roles: 3</span>
            </div>
          </div>
        </FeatureBentoCard>

        {/* Bento Card 3: Products & Subscription Packages (col-span-3) */}
        <FeatureBentoCard className="sm:col-span-3 p-6 sm:p-8 min-h-[220px] flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center h-full">
            <div className="flex-1 space-y-4 lg:col-span-6">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-orange-500/10 text-orange-500 dark:bg-orange-500/12">
                  <Package size={20} strokeWidth={2} />
                </div>
                <span className="rounded-full bg-[#ECF2FF] text-[#3B82F6] dark:bg-blue-500/12 dark:text-blue-400 px-2.5 py-0.5 text-[10px] font-semibold">
                  {t('companii.features.statusPlanned', { defaultValue: 'În Plan' })}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base">
                  {t('companii.features.f3Title', { defaultValue: 'Pachete și Servicii' })}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-white/60 max-w-md">
                  {t('companii.features.f3Desc', { defaultValue: 'Personalizează ofertele companiei, stabilește tarife flexibile, abonamente pentru clienții fideli și instrumente avansate de promovare.' })}
                </p>
              </div>
            </div>

            {/* Widescreen widget */}
            <div className="lg:col-span-6 w-full select-none">
              <div className="grid grid-cols-2 gap-3">
                {/* Package Card 1 */}
                <div className="rounded-xl border border-gray-100 bg-white/[0.4] backdrop-blur-md p-3 text-[10px] dark:border-white/[0.06] dark:bg-white/[0.02] shadow-sm flex flex-col justify-between h-[96px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 dark:text-white/80">Basic Plan</span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-[8px] text-gray-500 dark:text-white/55">Standard</span>
                    </div>
                    <p className="text-slate-400 dark:text-white/30 text-[9px] mt-0.5">3 specialists profile</p>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-2 border-t border-gray-100/50 pt-1.5 dark:border-white/[0.04]">
                    <span className="font-bold text-slate-700 dark:text-white/80 text-[12px]">299</span>
                    <span className="text-[8px] text-slate-400">MDL/mo</span>
                  </div>
                </div>

                {/* Package Card 2 */}
                <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/05 to-violet-500/02 backdrop-blur-md p-3 text-[10px] dark:border-violet-500/15 shadow-sm flex flex-col justify-between h-[96px] relative overflow-hidden">
                  <div className="absolute right-0 top-0 bg-[#8B5CF6] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                    POPULAR
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-violet-750 dark:text-violet-400">Enterprise</span>
                    </div>
                    <p className="text-violet-500/60 dark:text-violet-400/40 text-[9px] mt-0.5">Unlimited specialists</p>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-2 border-t border-violet-500/10 pt-1.5 dark:border-white/[0.04]">
                    <span className="font-bold text-violet-750 dark:text-violet-400 text-[12px]">899</span>
                    <span className="text-[8px] text-violet-500/50">MDL/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FeatureBentoCard>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6">
        <Button
          asChild
          className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#8B5CF6] px-4 text-[13px] font-semibold text-white shadow-none hover:bg-[#7c4fe0]"
        >
          <RouterLink to={paths.companii}>
            {t('home.companii.ctaLearn')}
            <ArrowRight size={14} strokeWidth={2} />
          </RouterLink>
        </Button>
        <Button
          asChild
          variant="outline"
          className={cn(
            'inline-flex h-10 rounded-[14px] border-2 px-4 text-[13px] font-medium shadow-none',
            'border-[#E9ECEF] bg-white text-[#495057] hover:border-violet-500/35 hover:bg-violet-500/10 hover:text-violet-700',
            'dark:border-white/12 dark:bg-white/[0.04] dark:text-white/90',
          )}
        >
          <RouterLink to={`${paths.companii}#waitlist`}>{t('home.companii.ctaWaitlist')}</RouterLink>
        </Button>
      </div>
    </div>
  );
}
