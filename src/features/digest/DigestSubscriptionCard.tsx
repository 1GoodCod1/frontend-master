import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import {
  useDigestStatusQuery,
  useDigestSubscribeMutation,
  useDigestUnsubscribeMutation,
} from './digestApi';

export function DigestSubscriptionCard() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: status, isLoading } = useDigestStatusQuery(undefined, {
    skip: !isAuthed,
  });
  const [subscribe, { isLoading: isSubscribing }] = useDigestSubscribeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] =
    useDigestUnsubscribeMutation();

  if (!isAuthed || isLoading) {
    return null;
  }

  const description =
    role === 'MASTER'
      ? t('digest.descriptionMaster')
      : t('digest.descriptionClient');

  const handleSubscribe = async () => {
    try {
      await subscribe().unwrap();
      setShowSuccess(true);
      toast.success(t('digest.success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe().unwrap();
      toast.success(t('digest.unsubscribed'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (showSuccess && !status?.subscribed) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mx-auto max-w-6xl rounded-xl sm:rounded-2xl bg-white dark:bg-white/[0.04] px-4 py-4 sm:px-6 sm:py-6 shadow-sm">
          <div className="mx-auto flex max-w-[560px] items-center gap-2 sm:gap-3 text-foreground">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-cta/20 text-cta">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <p className="text-sm sm:text-base font-semibold">{t('digest.success')}</p>
          </div>
        </div>
      </div>
    );
  }

  const isSubscribed = status?.subscribed ?? false;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="mx-auto max-w-6xl rounded-xl sm:rounded-2xl bg-white dark:bg-white/[0.04] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7 shadow-sm">
        <div className="mx-auto flex max-w-[640px] flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 sm:mb-1 text-sm sm:text-base font-bold text-foreground">
              {t('digest.title')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isSubscribed ? t('digest.subscribedNote') : description}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
              <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              {t('digest.emailNote')}
            </p>
          </div>
          <div className="flex shrink-0 w-full sm:w-auto">
            <Button
              type="button"
              onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
              disabled={isSubscribing || isUnsubscribing}
              variant={isSubscribed ? 'outline' : 'default'}
              className={
                isSubscribed
                  ? 'w-full sm:min-w-[120px] min-h-[40px] sm:min-h-[44px] rounded-lg sm:rounded-xl text-sm font-semibold'
                  : 'w-full sm:min-w-[120px] min-h-[40px] sm:min-h-[44px] rounded-lg sm:rounded-xl text-sm font-semibold dark:bg-cta dark:text-cta-foreground dark:hover:bg-cta/90'
              }
            >
              {isSubscribing || isUnsubscribing
                ? t('common.loading')
                : isSubscribed
                  ? t('digest.unsubscribeButton')
                  : t('digest.subscribeButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
