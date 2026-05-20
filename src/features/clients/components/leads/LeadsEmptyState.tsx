import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { ClientEmptyState } from '@/components/client/ClientEmptyState';

export default function ClientRequestsEmptyState() {
  const { t } = useTranslation();

  return (
    <ClientEmptyState
      icon={Mail}
      title={t('clientDashboard.noLeads', 'Нет заявок')}
      description={t('clientDashboard.noLeadsSubtitle', 'Вы еще не отправляли заявок мастерам')}
    />
  );
}
