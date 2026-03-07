import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LeadsEmptyState() {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card text-center">
      <CardContent className="p-8">
        <Mail className="mx-auto mb-4 size-16 text-muted-foreground opacity-50" />
        <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
          {t('clientDashboard.noLeads')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('clientDashboard.noLeadsSubtitle')}
        </p>
      </CardContent>
    </Card>
  );
}
