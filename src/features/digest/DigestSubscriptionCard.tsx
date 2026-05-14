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
import { USER_ROLE } from '@/constants/roles';

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
    role === USER_ROLE.MASTER
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
      setShowSuccess(false);
      toast.success(t('digest.unsubscribed'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (showSuccess && !status?.subscribed) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{t('digest.success')}</span>
        </div>
      </div>
    );
  }

  const isSubscribed = status?.subscribed ?? false;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-[#E97525]/15 dark:text-[#E97525]">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {t('digest.title')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {isSubscribed ? t('digest.subscribedNote') : description}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
          disabled={isSubscribing || isUnsubscribing}
          variant={isSubscribed ? 'outline' : 'default'}
          size="sm"
          className="h-9 px-5 text-xs font-semibold rounded-full shrink-0 self-start sm:self-auto"
        >
          {isSubscribing || isUnsubscribing
            ? t('common.loading')
            : isSubscribed
              ? t('digest.unsubscribeButton')
              : t('digest.subscribeButton')}
        </Button>
      </div>
    </div>
  );
}
