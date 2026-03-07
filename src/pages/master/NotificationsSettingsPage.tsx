import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/common/States';
import { NotificationChannelsForm } from '@/features/masters/components/master/NotificationChannelsForm';
import { useNotificationSettings } from '@/hooks/master/useNotificationSettings';

export default function NotificationsSettingsPage() {
  const { t } = useTranslation();
  const { isPremium, isLoading, isError, refetch } = useNotificationSettings();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader
          title={t('notificationSettings.title')}
          subtitle={t('notificationSettings.subtitle')}
        />
      </div>

      {!isPremium ? (
        <Card className="overflow-hidden border-amber-200/60 dark:border-amber-600/30 bg-amber-500/5 dark:bg-amber-500/10 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none transition-all duration-300">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:text-left">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
              <Crown className="size-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                {t('notificationSettings.premiumRequired')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('notificationSettings.premiumRequiredDesc')}
              </p>
              <Button asChild className="mt-4 border-0 bg-amber-600 text-white shadow-md transition-all hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500">
                <RouterLink to="/plans">{t('notificationSettings.viewPlans')}</RouterLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <NotificationChannelsForm />
      )}
    </div>
  );
}
