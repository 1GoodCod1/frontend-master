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
import { useIsDark } from '@/hooks/useIsDark';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';

/** Marketing landing for the upcoming "Faber for companies" product. */

type FeatureStatus = 'soon' | 'planned';

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

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function CompaniiLandingPage() {
  const { t } = useTranslation();
  const isDark = useIsDark();

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
    // NOTE: waitlist persistence (POST /companies/waitlist) is not wired yet —
    // see plan file. For now the form confirms locally.
    setSubmitted(true);
  };

  return (
    <>
      <SEOHead
        title={t('companii.seoTitle')}
        description={t('companii.seoDescription')}
      />

      <div className="animate-fade-in">
        {/* ───────────── HERO ───────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 -z-10',
              isDark
                ? 'bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]'
                : 'bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%)]',
            )}
          />
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
            <span
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-6',
                'bg-primary/10 text-primary border border-primary/20',
              )}
            >
              <Building2 className="size-3.5" strokeWidth={2} />
              {t('companii.hero.badge')}
            </span>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {t('companii.hero.titlePre')}
              <br className="hidden sm:block" />{' '}
              <span className="text-primary">{t('companii.hero.titleAccent')}</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg max-w-2xl mx-auto text-slate-600 dark:text-slate-300">
              {t('companii.hero.subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={() => scrollToId('waitlist')}>
                {t('companii.hero.ctaPrimary')}
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToId('features')}>
                {t('companii.hero.ctaSecondary')}
                <ArrowDown />
              </Button>
            </div>

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              {t('companii.hero.note')}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {(['trust1', 'trust2', 'trust3'] as const).map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400"
                >
                  <CheckCircle2 className="size-4 text-primary" />
                  {t(`companii.hero.${k}`)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── PROBLEM ───────────── */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
          <SectionKicker isDark={isDark} text={t('companii.problem.kicker')} />
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {t('companii.problem.title')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-500 dark:text-slate-400">
            {t('companii.problem.lead')}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {PROBLEMS.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className={cn(
                  'flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl',
                  'bg-[#F9FAFB] border border-gray-200/80',
                  'dark:bg-white/[0.04] dark:border-white/[0.07]',
                )}
              >
                <div className="shrink-0 p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                  {t(`companii.problem.${key}`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────── FEATURES ───────────── */}
        <section
          id="features"
          className={cn(
            'scroll-mt-20 py-14 sm:py-20',
            isDark ? 'bg-white/[0.02]' : 'bg-slate-50/70',
          )}
        >
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <SectionKicker isDark={isDark} text={t('companii.features.kicker')} />
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {t('companii.features.title')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-500 dark:text-slate-400">
              {t('companii.features.subtitle')}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {FEATURES.map(({ icon: Icon, key, status }) => {
                const soon = status === 'soon';
                return (
                  <div
                    key={key}
                    className={cn(
                      'group h-full flex flex-col p-5 sm:p-6 rounded-2xl',
                      'bg-white border border-gray-200/80 shadow-sm',
                      'dark:bg-white/[0.05] dark:border-white/[0.08] dark:shadow-none',
                      'hover:-translate-y-1 hover:shadow-md transition duration-300',
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          'p-2.5 rounded-xl',
                          soon
                            ? 'bg-primary/10 text-primary'
                            : 'bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400',
                        )}
                      >
                        <Icon className="size-6" strokeWidth={1.75} />
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full',
                          soon
                            ? 'bg-primary/10 text-primary'
                            : 'bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400',
                        )}
                      >
                        {soon
                          ? t('companii.features.statusSoon')
                          : t('companii.features.statusPlanned')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                      {t(`companii.features.${key}Title`)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {t(`companii.features.${key}Desc`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───────────── TIMELINE ───────────── */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
          <SectionKicker isDark={isDark} text={t('companii.timeline.kicker')} />
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {t('companii.timeline.title')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-500 dark:text-slate-400">
            {t('companii.timeline.subtitle')}
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {TIMELINE.map(({ icon: Icon, phase, items, current }) => (
              <div
                key={phase}
                className={cn(
                  'flex flex-col p-5 sm:p-6 rounded-2xl border',
                  current
                    ? 'bg-primary/[0.06] border-primary/30 dark:bg-primary/[0.08] dark:border-primary/25'
                    : 'bg-[#F9FAFB] border-gray-200/80 dark:bg-white/[0.04] dark:border-white/[0.07]',
                )}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      current
                        ? 'bg-primary/15 text-primary'
                        : 'bg-slate-500/10 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400',
                    )}
                  >
                    <Icon className="size-5" strokeWidth={1.85} />
                  </div>
                  <span
                    className={cn(
                      'font-bold text-base',
                      current ? 'text-primary' : 'text-slate-700 dark:text-slate-200',
                    )}
                  >
                    {t(`companii.timeline.${phase}Label`)}
                  </span>
                  {current && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                      {t('companii.timeline.nowBadge')}
                    </span>
                  )}
                </div>

                <ul className="mt-4 space-y-2.5">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <CheckCircle2
                        className={cn(
                          'size-4 shrink-0',
                          current
                            ? 'text-primary'
                            : 'text-slate-300 dark:text-slate-600',
                        )}
                      />
                      {t(`companii.timeline.${item}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────── WAITLIST ───────────── */}
        <section
          id="waitlist"
          className={cn(
            'scroll-mt-20 py-14 sm:py-20',
            isDark ? 'bg-white/[0.02]' : 'bg-slate-50/70',
          )}
        >
          <div className="container mx-auto max-w-xl px-4 sm:px-6">
            <div
              className={cn(
                'rounded-3xl p-6 sm:p-9 text-center',
                'bg-white border border-gray-200/80 shadow-sm',
                'dark:bg-white/[0.05] dark:border-white/[0.08] dark:shadow-none',
              )}
            >
              {submitted ? (
                <div className="py-6">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <CheckCircle2 className="size-7" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {t('companii.waitlist.successTitle')}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                    {t('companii.waitlist.successText')}
                  </p>
                </div>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-primary/10 text-primary mb-4">
                    <Sparkles className="size-3.5" />
                    {t('companii.waitlist.kicker')}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {t('companii.waitlist.title')}
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                    {t('companii.waitlist.subtitle')}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left" noValidate>
                    <div>
                      <label
                        htmlFor="companii-company"
                        className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-300"
                      >
                        {t('companii.waitlist.companyLabel')}
                      </label>
                      <input
                        id="companii-company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={t('companii.waitlist.companyPlaceholder')}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="companii-email"
                        className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-300"
                      >
                        {t('companii.waitlist.emailLabel')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          id="companii-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('companii.waitlist.emailPlaceholder')}
                          className={cn(fieldClass, 'pl-9')}
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                    )}

                    <Button type="submit" size="lg" className="w-full">
                      {t('companii.waitlist.submit')}
                      <Send />
                    </Button>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {t('companii.waitlist.privacy')}
                    </p>
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

const fieldClass = cn(
  'w-full h-10 rounded-xl px-3 text-sm transition-colors',
  'bg-white border border-gray-300 text-slate-900 placeholder:text-slate-400',
  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
  'dark:bg-white/[0.04] dark:border-white/[0.12] dark:text-slate-100 dark:placeholder:text-slate-500',
);

function SectionKicker({ isDark, text }: { isDark: boolean; text: string }) {
  return (
    <span
      className={cn(
        'inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.18em]',
        isDark ? 'text-primary/80' : 'text-primary',
      )}
    >
      {text}
    </span>
  );
}
