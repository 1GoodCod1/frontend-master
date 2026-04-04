import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Handshake,
  Star,
  Badge,
  ShieldCheck,
  MessageCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const clientSteps = [
  { icon: Search, titleKey: 'step1', descKey: 'step1' },
  { icon: UserPlus, titleKey: 'step2', descKey: 'step2' },
  { icon: Handshake, titleKey: 'step3', descKey: 'step3' },
  { icon: Star, titleKey: 'step4', descKey: 'step4' },
];

const masterSteps = [
  { icon: Badge, titleKey: 'masterStep1', descKey: 'masterStep1' },
  { icon: ShieldCheck, titleKey: 'masterStep2', descKey: 'masterStep2' },
  { icon: MessageCircle, titleKey: 'masterStep3', descKey: 'masterStep3' },
  { icon: TrendingUp, titleKey: 'masterStep4', descKey: 'masterStep4' },
];

function StepCard({
  Icon,
  titleKey,
  descKey,
  t,
  index,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
  t: (k: string) => string;
  index: number;
}) {
  return (
    <div
      className="faber-page-enter"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Card className="h-full text-center border-border transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/30">
        <CardContent className="p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary mb-4">
            <Icon className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold mb-2 tracking-tight text-foreground">
            {t(`howItWorks.${titleKey}.title`)}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(`howItWorks.${descKey}.description`)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HowItWorksPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('howItWorks.title')}
        description={t('howItWorks.subtitle')}
        keywords={t('howItWorks.seoKeywords')}
      />
      <div className="faber-page-enter container max-w-5xl mx-auto py-8 md:py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {t('howItWorks.title')}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('howItWorks.subtitle')}
        </p>
      </div>

      <section className="relative mt-8">
        <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">
          {t('howItWorks.forClients')}
        </h2>
        <div className="hidden md:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 rounded-full bg-primary/15" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {clientSteps.map((step, i) => (
            <StepCard
              key={step.titleKey}
              Icon={step.icon}
              titleKey={step.titleKey}
              descKey={step.descKey}
              t={t}
              index={i}
            />
          ))}
        </div>
      </section>

      <section className="relative mt-12">
        <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">
          {t('howItWorks.forMasters')}
        </h2>
        <div className="hidden md:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 rounded-full bg-primary/15" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {masterSteps.map((step, i) => (
            <StepCard
              key={step.titleKey}
              Icon={step.icon}
              titleKey={step.titleKey}
              descKey={step.descKey}
              t={t}
              index={i + 4}
            />
          ))}
        </div>
      </section>

      <div className="faber-page-enter mt-12 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
        <h3 className="text-xl font-bold mb-3 tracking-tight text-foreground">
          {t('howItWorks.ready.title')}
        </h3>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
          {t('howItWorks.ready.description')}
        </p>
        <Button asChild size="lg" className="gap-2 font-semibold">
          <RouterLink to="/masters">
            {t('nav.masters')}
            <ArrowRight className="h-4 w-4" />
          </RouterLink>
        </Button>
      </div>
    </div>
    </>
  );
}
