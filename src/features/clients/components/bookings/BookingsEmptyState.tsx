import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { ClientEmptyState } from '@/components/client/ClientEmptyState';

export default function BookingsEmptyState() {
  const { t } = useTranslation();

  return (
    <ClientEmptyState
      icon={Calendar}
      title={t('clientDashboard.noBookings')}
      description={t('clientDashboard.noBookingsSubtitle')}
    />
  );
}
