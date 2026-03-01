import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole, selectIsVerified } from '@/features/auth/selectors';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import {
  usePaymentsCreateMiaCheckoutMutation,
} from '@/features/payments/paymentsApi';
import type { PaidTariff } from '@/features/auth/plan';

const VALID_PLANS: PaidTariff[] = ['VIP', 'PREMIUM'];

function getPlanFromSearchParams(searchParams: URLSearchParams): PaidTariff | null {
  const plan = searchParams.get('plan')?.toUpperCase();
  if (plan === 'VIP' || plan === 'PREMIUM') return plan;
  return null;
}

function getIsPendingFromSearchParams(searchParams: URLSearchParams): boolean {
  return searchParams.get('pending') === '1';
}

function getMyMasterIdFromProfile(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const unwrapped =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root;
  const id = unwrapped.id ?? (unwrapped.master && typeof unwrapped.master === 'object' ? (unwrapped.master as Record<string, unknown>).id : null);
  return typeof id === 'string' && id ? id : null;
}

function getErrorMessage(e: unknown): string | null {
  if (!e) return null;
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && 'data' in e) {
    const data = (e as { data?: unknown }).data;
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
    }
  }
  if (typeof e === 'object' && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  return null;
}

export function usePaymentOptionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isVerified = useAppSelector(selectIsVerified);
  const isMaster = isAuthed && role === 'MASTER';

  const planFromQuery = getPlanFromSearchParams(searchParams);
  const isPendingUpgrade = getIsPendingFromSearchParams(searchParams);

  const myProfile = useMastersMyProfileQuery(undefined, { skip: !isMaster });
  const myMasterId: string | null = getMyMasterIdFromProfile(myProfile.data);

  const [createMiaCheckout, miaCheckoutState] = usePaymentsCreateMiaCheckoutMutation();

  const planKey: PaidTariff | null = isPendingUpgrade ? (planFromQuery ?? 'PREMIUM') : planFromQuery;
  const planLabel = planKey ? t(`plans.${planKey.toLowerCase()}.name`) : '';
  const miaLoading = miaCheckoutState.isLoading;

  useEffect(() => {
    if (!isAuthed) {
      navigate('/login', { replace: true });
      return;
    }
    if (!isMaster) {
      navigate('/plans', { replace: true });
      return;
    }
    // Верифицированные мастера получают тариф бесплатно — не показываем оплату
    if (isMaster && isVerified && !isPendingUpgrade) {
      navigate('/plans', { replace: true });
      return;
    }
    // Неверифицированные мастера — способы оплаты скрыты, направляем на верификацию
    if (isMaster && !isVerified) {
      navigate('/dashboard/verification', { replace: true });
      return;
    }
    if (!isPendingUpgrade && !planFromQuery) {
      navigate('/plans', { replace: true });
    }
  }, [isAuthed, isMaster, isVerified, isPendingUpgrade, planFromQuery, navigate]);

  const onPayWithMia = async (): Promise<{ qrUrl: string; paymentId: string } | null> => {
    if (isPendingUpgrade) return null;
    if (!myMasterId || !planKey) {
      toast.error(t('plans.profileNotLoaded'));
      return null;
    }
    try {
      const res = await createMiaCheckout({
        masterId: myMasterId,
        tariffType: planKey,
      }).unwrap();
      const qrUrl = res.qrUrl;
      const paymentId = res.paymentId ?? res.orderId;
      if (qrUrl) return { qrUrl, paymentId: paymentId ?? '' };
      toast.error(t('plans.noCheckoutUrl'));
      return null;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) ?? t('plans.checkoutFailed'));
      return null;
    }
  };

  return {
    planKey,
    planLabel,
    planPrice: planKey ? t(`plans.${planKey.toLowerCase()}.price`) : '',
    isPendingUpgrade,
    onPayWithMia,
    miaLoading,
    isReady: isMaster && (isPendingUpgrade || (planFromQuery && VALID_PLANS.includes(planFromQuery))),
    isLoadingProfile: isMaster && myProfile.isLoading,
  };
}
