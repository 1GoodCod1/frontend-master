import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ClientRequestsEmptyState() {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col items-center justify-center border-dashed border-black/10 bg-black/[0.02] p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100/50 text-amber-500 dark:bg-amber-500/10">
        <Mail className="size-6 text-amber-500" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-foreground">
        {t('clientDashboard.noLeads', 'Нет заявок')}
      </h3>
      <p className="mx-auto max-w-sm text-sm text-muted-foreground">
        {t('clientDashboard.noLeadsSubtitle', 'Вы еще не отправляли заявок мастерам')}
      </p>
    </Card>
  );
}
