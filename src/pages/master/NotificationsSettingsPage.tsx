import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/common/States';
import { NotificationChannelsForm } from '@/features/masters/components/master/NotificationChannelsForm';
import { useNotificationSettings } from '@/hooks/master/useNotificationSettings';
import { cn } from '@/lib/utils';
import {
  masterCardStaticCls,
  masterIconWrapCls,
  masterPageClassName,
  masterPrimaryBtnCls,
  masterSectionTitleCls,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';

export default function NotificationsSettingsPage() {
  const { t } = useTranslation();
  const { isPremium, isLoading, isError, refetch } = useNotificationSettings();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className={masterPageClassName}>
      <PageHeader
        title={t('notificationSettings.title')}
        subtitle={t('notificationSettings.subtitle')}
      />

      {!isPremium ? (
        <div className={cn(masterCardStaticCls, 'border-[#E97525]/25')}>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:text-left">
            <span className={cn(masterIconWrapCls, 'h-14 w-14 rounded-[12px]')}>
              <Crown className="size-7" />
            </span>
            <div className="space-y-1">
              <h3 className={masterSectionTitleCls}>{t('notificationSettings.premiumRequired')}</h3>
              <p className={masterTextMuted}>{t('notificationSettings.premiumRequiredDesc')}</p>
              <Button asChild className={cn(masterPrimaryBtnCls, 'mt-4')}>
                <RouterLink to="/plans">{t('notificationSettings.viewPlans')}</RouterLink>
              </Button>
            </div>
          </CardContent>
        </div>
      ) : (
        <NotificationChannelsForm />
      )}
    </div>
  );
}
