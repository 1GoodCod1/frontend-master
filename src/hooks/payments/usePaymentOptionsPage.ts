import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole, selectIsVerified } from '@/features/auth/selectors';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { usePaymentsCreateMiaCheckoutMutation } from '@/features/payments/paymentsApi';
import type { PaidTariff } from '@/features/auth/plan';
import {
  getPlanFromSearchParams,
  getIsPendingFromSearchParams,
  getMasterIdFromProfile,
  getPaymentErrorMessage,
  VALID_PLANS,
} from './utils';
import { USER_ROLE } from '@/constants/roles';

export function usePaymentOptionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isVerified = useAppSelector(selectIsVerified);
  const isMaster = isAuthed && role === USER_ROLE.MASTER;

  const planFromQuery = getPlanFromSearchParams(searchParams);
  const isPendingUpgrade = getIsPendingFromSearchParams(searchParams);

  const myProfile = useMastersMyProfileQuery(undefined, { skip: !isMaster });
  const myMasterId: string | null = getMasterIdFromProfile(myProfile.data);

  const [createMiaCheckout, miaCheckoutState] = usePaymentsCreateMiaCheckoutMutation();

  const planKey: PaidTariff | null = isPendingUpgrade ? (planFromQuery ?? 'PRO') : planFromQuery;
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
      toast.error(getPaymentErrorMessage(e) ?? t('plans.checkoutFailed'));
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
