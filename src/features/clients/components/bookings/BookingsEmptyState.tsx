import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingsEmptyState() {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card text-center">
      <CardContent className="p-8">
        <Calendar className="mx-auto mb-4 size-16 text-muted-foreground opacity-50" />
        <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
          {t('clientDashboard.noBookings')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('clientDashboard.noBookingsSubtitle')}
        </p>
      </CardContent>
    </Card>
  );
}
