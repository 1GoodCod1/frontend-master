import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Briefcase, Search, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import { getPostJobNavigationPath } from '@/utils/postJobNavigation';

type HomeClosingCtaSectionProps = {
  isAuthed: boolean;
  role: string | null;
};

export function HomeClosingCtaSection({ isAuthed, role }: HomeClosingCtaSectionProps) {
  const { t } = useTranslation();
  const isMaster = isAuthed && role === USER_ROLE.MASTER;
  const postJobPath = getPostJobNavigationPath(isAuthed, role);

  const cards = isMaster
    ? [
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
      ]
    : [
        {
          icon: Search,
          title: t('home.closingCta.clientSearchTitle'),
          desc: t('home.closingCta.clientSearchDesc'),
          cta: t('home.findMasters'),
          to: paths.masters,
          accent: '#E97525',
        },
        {
          icon: Briefcase,
          title: t('home.closingCta.clientJobsTitle'),
          desc: t('home.closingCta.clientJobsDesc'),
          cta: t('home.heroPostJob'),
          to: postJobPath,
          accent: '#F59E0B',
        },
      ];

  return (
    <section className="relative scroll-mt-20 pt-10 md:pt-14">
      <div className={cn('rounded-xl sm:rounded-2xl p-5 sm:p-7 md:p-8', surfaceCardCls)}>
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <h2 className="text-[clamp(22px,2.5vw,30px)] font-bold tracking-[-0.025em] text-foreground">
            {t('home.closingCta.title')}
          </h2>
          <p className="mt-2 text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
            {t('home.closingCta.subtitle')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {cards.map(({ icon: Icon, title, desc, cta, to, accent }) => (
            <div
              key={title}
              className={cn(
                'rounded-xl px-4 py-4 sm:px-5 sm:py-5 border',
                'border-[#e8e8e8] dark:border-[#2d2d2d]',
                'bg-[hsl(var(--secondary)/0.35)] dark:bg-white/[0.03]',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 p-2.5 rounded-xl"
                  style={{ backgroundColor: `${accent}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-[15px] text-foreground">{title}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-snug">{desc}</p>
                  <Button
                    asChild
                    variant="ghost"
                    className="mt-3 h-auto p-0 gap-1.5 text-[13px] font-medium hover:bg-transparent"
                    style={{ color: accent }}
                  >
                    <RouterLink to={to}>
                      {cta}
                      <ArrowRight size={13} strokeWidth={2} />
                    </RouterLink>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
