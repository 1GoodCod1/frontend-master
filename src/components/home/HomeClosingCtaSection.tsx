import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Briefcase, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';

/** Bottom CTA for masters only — clients get actions inside HowItWorksSection. */
export function HomeClosingCtaSection() {
  const { t } = useTranslation();

  const cards = [
    {
      icon: Briefcase,
      title: t('home.closingCta.masterJobsTitle'),
      desc: t('home.closingCta.masterJobsDesc'),
      cta: t('home.heroBrowseJobs'),
      to: paths.jobs.list,
      accent: '#F59E0B',
    },
    {
      icon: CreditCard,
      title: t('home.closingCta.masterPlansTitle'),
      desc: t('home.closingCta.masterPlansDesc'),
      cta: t('home.viewPlans'),
      to: paths.plans,
      accent: '#E97525',
    },
  ] as const;

  return (
    <section id="start" className="relative scroll-mt-20 pt-10 md:pt-14">
      <div className={cn('rounded-[18px] p-5 sm:p-7 md:p-8', surfaceCardCls)}>
        <div className="mb-5 max-w-xl sm:mb-6">
          <h2 className="text-[clamp(22px,2.5vw,30px)] font-bold tracking-[-0.025em] text-foreground">
            {t('home.closingCta.masterTitle')}
          </h2>
          <p className="mt-1.5 text-[13px] leading-snug text-[#6C757D] dark:text-white/50">
            {t('home.closingCta.masterSubtitle')}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {cards.map(({ icon: Icon, title, desc, cta, to, accent }) => (
            <div
              key={title}
              className={cn(
                'flex flex-col rounded-[14px] border px-4 py-4',
                'border-[#E9ECEF] bg-[hsl(var(--secondary)/0.35)] dark:border-white/10 dark:bg-white/[0.03]',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: `${accent}18` }}
                >
                  <Icon className="size-5" style={{ color: accent }} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#212529] dark:text-white">{title}</p>
                  <p className="mt-1 text-xs leading-snug text-[#6C757D] dark:text-white/50">{desc}</p>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                className="mt-3 h-auto justify-start gap-1.5 p-0 text-[13px] font-medium hover:bg-transparent"
                style={{ color: accent }}
              >
                <RouterLink to={to}>
                  {cta}
                  <ArrowRight size={13} strokeWidth={2} />
                </RouterLink>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
