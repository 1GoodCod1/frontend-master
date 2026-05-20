import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Users,
  Package,
  Contact,
  Wrench,
  CalendarDays,
  MessagesSquare,
  MapPin,
  Calculator,
  UserRound,
  Hammer,
  Clock,
  Compass,
  Mail,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHead } from '@/components/home/SectionHead';
import { COMPANII_SECTION_ACCENT } from '@/constants/home';
import {
  cabinetCardStaticCls,
  cabinetFormLabelCls,
  cabinetInputCls,
  cabinetOutlineBtnCls,
  cabinetTextBody,
  cabinetTextMuted,
  cabinetTextTitle,
} from '@/lib/cabinetStyles';

type FeatureStatus = 'soon' | 'planned';

const COMPANII_PRIMARY_BTN = cn(
  'inline-flex h-10 items-center justify-center gap-2 rounded-[14px] px-4',
  'text-[13px] font-semibold text-white shadow-none transition-colors',
  'bg-[#8B5CF6] hover:bg-[#7c4fe0]',
);

const COMPANII_ICON_WRAP = cn(
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]',
  'bg-violet-500/10 text-[#8B5CF6] dark:bg-violet-500/12',
);

const companiiInputCls = cn(
  cabinetInputCls,
  'focus-visible:ring-violet-500/20 focus-visible:border-violet-500/45',
);

const FEATURES: { icon: LucideIcon; key: string; status: FeatureStatus }[] = [
  { icon: Building2, key: 'f1', status: 'soon' },
  { icon: Users, key: 'f2', status: 'soon' },
  { icon: Package, key: 'f3', status: 'soon' },
  { icon: Contact, key: 'f4', status: 'planned' },
  { icon: Wrench, key: 'f5', status: 'planned' },
  { icon: CalendarDays, key: 'f6', status: 'planned' },
];

const PROBLEMS: { icon: LucideIcon; key: string }[] = [
  { icon: MessagesSquare, key: 'p1' },
  { icon: MapPin, key: 'p2' },
  { icon: Calculator, key: 'p3' },
  { icon: UserRound, key: 'p4' },
];

const TIMELINE: {
  icon: LucideIcon;
  phase: 'now' | 'next' | 'later';
  items: string[];
  current?: boolean;
}[] = [
  { icon: Hammer, phase: 'now', items: ['now1', 'now2', 'now3', 'now4'], current: true },
  { icon: Clock, phase: 'next', items: ['next1', 'next2', 'next3'] },
  { icon: Compass, phase: 'later', items: ['later1', 'later2', 'later3'] },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGE_CONTAINER = 'container mx-auto max-w-[1280px] px-4 sm:px-8';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function statusBadgeCls(soon: boolean) {
  return cn(
    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
    soon
      ? 'bg-violet-500/10 text-violet-700 dark:bg-violet-500/12 dark:text-violet-400'
      : 'bg-[#F1F3F5] text-[#6C757D] dark:bg-white/[0.06] dark:text-white/55',
  );
}

export default function CompaniiLandingPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company.trim()) {
      setError(t('companii.waitlist.errorCompany'));
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('companii.waitlist.errorEmail'));
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <>
      <SEOHead title={t('companii.seoTitle')} description={t('companii.seoDescription')} />

      <div className="animate-fade-in">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(139,92,246,0.12),transparent_70%)]"
          />
          <div className={cn(PAGE_CONTAINER, 'max-w-3xl py-14 text-center sm:py-20')}>
            <span
              className={cn(
                'mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1',
                'border-violet-500/20 bg-violet-500/10 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700',
                'dark:border-violet-500/25 dark:bg-violet-500/12 dark:text-violet-400',
              )}
            >
              <Building2 className="size-3.5" strokeWidth={2} />
              {t('companii.hero.badge')}
            </span>

            <h1 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.025em] leading-[1.1] text-[#212529] dark:text-white">
              {t('companii.hero.titlePre')}{' '}
              <span style={{ color: COMPANII_SECTION_ACCENT }}>{t('companii.hero.titleAccent')}</span>
            </h1>

            <p className={cn('mx-auto mt-4 max-w-2xl', cabinetTextBody)}>{t('companii.hero.subtitle')}</p>

            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Button className={COMPANII_PRIMARY_BTN} onClick={() => scrollToId('waitlist')}>
                {t('companii.hero.ctaPrimary')}
                <ArrowRight className="size-4" strokeWidth={2} />
              </Button>
              <Button className={cn(cabinetOutlineBtnCls, 'h-10')} onClick={() => scrollToId('features')}>
                {t('companii.hero.ctaSecondary')}
                <ArrowDown className="size-4" strokeWidth={2} />
              </Button>
            </div>

            <p className={cn('mt-3', cabinetTextMuted)}>{t('companii.hero.note')}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {(['trust1', 'trust2', 'trust3'] as const).map((k) => (
                <span key={k} className={cn('inline-flex items-center gap-1.5', cabinetTextMuted)}>
                  <CheckCircle2 className="size-4 text-[#8B5CF6]" strokeWidth={2} />
                  {t(`companii.hero.${k}`)}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(PAGE_CONTAINER, 'max-w-5xl py-10 sm:py-14')}>
          <SectionHead
            kicker={t('companii.problem.kicker')}
            title={t('companii.problem.title')}
            accent={COMPANII_SECTION_ACCENT}
          />
          <p className={cn('-mt-4 mb-6 max-w-2xl', cabinetTextBody)}>{t('companii.problem.lead')}</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {PROBLEMS.map(({ icon: Icon, key }) => (
              <div key={key} className={cn('flex items-start gap-3 p-4 sm:p-5', cabinetCardStaticCls)}>
                <div className={COMPANII_ICON_WRAP}>
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <p className={cn('text-sm leading-snug', cabinetTextBody)}>{t(`companii.problem.${key}`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-y border-[#E9ECEF] bg-[#FAFBFC] py-10 dark:border-white/10 dark:bg-white/[0.02] sm:py-14">
          <div className={cn(PAGE_CONTAINER, 'max-w-5xl')}>
            <SectionHead
              kicker={t('companii.features.kicker')}
              title={t('companii.features.title')}
              accent={COMPANII_SECTION_ACCENT}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
              {FEATURES.map(({ icon: Icon, key, status }) => {
                const soon = status === 'soon';
                return (
                  <div
                    key={key}
                    className={cn(
                      'flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10',
                      cabinetCardStaticCls,
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className={COMPANII_ICON_WRAP}>
                        <Icon className="size-5" strokeWidth={2} />
                      </div>
                      <span className={statusBadgeCls(soon)}>
                        {soon ? t('companii.features.statusSoon') : t('companii.features.statusPlanned')}
                      </span>
                    </div>
                    <h3 className={cn('text-sm font-semibold', cabinetTextTitle)}>
                      {t(`companii.features.${key}Title`)}
                    </h3>
                    <p className={cn('mt-1.5 text-xs leading-snug', cabinetTextMuted)}>
                      {t(`companii.features.${key}Desc`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={cn(PAGE_CONTAINER, 'max-w-5xl py-10 sm:py-14')}>
          <SectionHead
            kicker={t('companii.timeline.kicker')}
            title={t('companii.timeline.title')}
            accent={COMPANII_SECTION_ACCENT}
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {TIMELINE.map(({ icon: Icon, phase, items, current }) => (
              <div
                key={phase}
                className={cn(
                  'flex flex-col rounded-[18px] border p-5 sm:p-6',
                  current
                    ? 'border-violet-500/30 bg-violet-500/[0.06] dark:border-violet-500/25 dark:bg-violet-500/[0.08]'
                    : cabinetCardStaticCls,
                )}
              >
                <div className="mb-1 flex items-center gap-2.5">
                  <div className={current ? COMPANII_ICON_WRAP : cn(COMPANII_ICON_WRAP, 'opacity-60')}>
                    <Icon className="size-5" strokeWidth={2} />
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      current ? 'text-[#8B5CF6]' : cabinetTextTitle,
                    )}
                  >
                    {t(`companii.timeline.${phase}Label`)}
                  </span>
                  {current ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-400">
                      <span className="size-1.5 animate-pulse rounded-full bg-violet-500" />
                      {t('companii.timeline.nowBadge')}
                    </span>
                  ) : null}
                </div>

                <ul className="mt-4 space-y-2">
                  {items.map((item) => (
                    <li key={item} className={cn('flex items-center gap-2 text-[13px]', cabinetTextBody)}>
                      <CheckCircle2
                        className={cn('size-4 shrink-0', current ? 'text-[#8B5CF6]' : 'text-[#CED4DA] dark:text-white/25')}
                        strokeWidth={2}
                      />
                      {t(`companii.timeline.${item}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section
          id="waitlist"
          className="scroll-mt-20 border-t border-[#E9ECEF] bg-[#FAFBFC] py-10 dark:border-white/10 dark:bg-white/[0.02] sm:py-14"
        >
          <div className={cn(PAGE_CONTAINER, 'max-w-xl')}>
            <div className={cn('p-6 text-center sm:p-8', cabinetCardStaticCls)}>
              {submitted ? (
                <div className="py-4">
                  <div className={cn('mx-auto mb-4', COMPANII_ICON_WRAP, 'h-14 w-14')}>
                    <CheckCircle2 className="size-7" strokeWidth={2} />
                  </div>
                  <h2 className={cn('text-lg font-bold sm:text-xl', cabinetTextTitle)}>
                    {t('companii.waitlist.successTitle')}
                  </h2>
                  <p className={cn('mt-2', cabinetTextBody)}>{t('companii.waitlist.successText')}</p>
                </div>
              ) : (
                <>
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
                    <Sparkles className="size-3.5" strokeWidth={2} />
                    {t('companii.waitlist.kicker')}
                  </span>
                  <h2 className={cn('text-[clamp(22px,2.5vw,30px)] font-bold tracking-[-0.025em]', cabinetTextTitle)}>
                    {t('companii.waitlist.title')}
                  </h2>
                  <p className={cn('mt-2', cabinetTextBody)}>{t('companii.waitlist.subtitle')}</p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left" noValidate>
                    <div className="space-y-1.5">
                      <Label htmlFor="companii-company" className={cabinetFormLabelCls}>
                        {t('companii.waitlist.companyLabel')}
                      </Label>
                      <Input
                        id="companii-company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={t('companii.waitlist.companyPlaceholder')}
                        className={companiiInputCls}
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="companii-email" className={cabinetFormLabelCls}>
                        {t('companii.waitlist.emailLabel')}
                      </Label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-[#868E96] dark:text-white/40"
                          strokeWidth={2}
                        />
                        <Input
                          id="companii-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('companii.waitlist.emailPlaceholder')}
                          className={cn(companiiInputCls, 'pl-9')}
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {error ? (
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                    ) : null}

                    <Button type="submit" className={cn(COMPANII_PRIMARY_BTN, 'h-11 w-full')}>
                      {t('companii.waitlist.submit')}
                      <Send className="size-4" strokeWidth={2} />
                    </Button>
                    <p className={cabinetTextMuted}>{t('companii.waitlist.privacy')}</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
