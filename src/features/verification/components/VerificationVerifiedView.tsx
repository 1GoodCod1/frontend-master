import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export function VerificationVerifiedView() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader title={t('verification.title')} subtitle={t('verification.verifiedSubtitle')} />
      </div>
      <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition duration-300 text-center">
        <CardContent className="flex flex-col items-center px-6 pt-10 pb-10">
          <CheckCircle className="mb-4 size-20 text-emerald-600 dark:text-emerald-500" />
          <h2 className="text-xl font-bold">{t('verification.verified')}</h2>
          <p className="mt-2 text-muted-foreground">{t('verification.verifiedMessage')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
