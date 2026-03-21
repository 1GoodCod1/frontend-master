import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMastersMyProfileQuery, useMastersMyTariffQuery, useMastersClaimFreePlanMutation } from '@/features/masters/mastersApi';
import {
  usePaymentsCancelPendingUpgradeMutation,
  usePaymentsCancelTariffAtPeriodEndMutation,
} from '@/features/payments/paymentsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole, selectIsVerified } from '@/features/auth/selectors';
import { PaidTariff, TariffPlan, effectivePlanFromMasterProfile, isPlan } from '@/features/auth/plan';
import { useGetActiveTariffsQuery } from '@/features/tariffs/tariffsApi';
import { plans, type PlanUI } from '@/types/plans';
import { isRecord } from '@/utils/guards';
import { unwrapEnvelope } from '@/utils/data';
import { toErrorMessage } from '@/utils/errors';
import { getMasterIdFromProfile } from './utils';

export function usePlansLogic() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const isAuthed = useAppSelector(selectIsAuthed);
    const role = useAppSelector(selectRole);
    const isVerified = useAppSelector(selectIsVerified);

    const [cancelPendingUpgrade, cancelState] = usePaymentsCancelPendingUpgradeMutation();
    const [cancelTariffAtPeriodEnd, cancelAtPeriodEndState] =
        usePaymentsCancelTariffAtPeriodEndMutation();
    const [claimFreePlan, claimState] = useMastersClaimFreePlanMutation();

    const isClient = isAuthed && role === 'CLIENT';
    const isMaster = isAuthed && role === 'MASTER';

    const myProfile = useMastersMyProfileQuery(undefined, { skip: !isMaster });
    const myTariff = useMastersMyTariffQuery(undefined, { skip: !isMaster });
    const { data: tariffsData, isLoading: tariffsLoading } = useGetActiveTariffsQuery();

    const myMasterId = getMasterIdFromProfile(myProfile.data);

    const rawTariff = unwrapEnvelope(myTariff.data);
    const tariff = isRecord(rawTariff) ? rawTariff : {};
    const tariffExpiresAt =
        typeof tariff.tariffExpiresAt === 'string' || typeof tariff.tariffExpiresAt === 'number'
            ? new Date(tariff.tariffExpiresAt)
            : null;
    const isExpired =
        typeof tariff.isExpired === 'boolean'
            ? tariff.isExpired
            : false;
    const pendingUpgrade = isRecord(tariff.pendingUpgrade) ? tariff.pendingUpgrade : null;
    const pendingUpgradeTo =
        pendingUpgrade && typeof pendingUpgrade.to === 'string' ? pendingUpgrade.to : undefined;
    const cancelAtPeriodEnd = tariff.tariffCancelAtPeriodEnd === true;

    // Use tariff API as source of truth for masters (has isExpired); profile can be stale
    const effectivePlan: TariffPlan = (() => {
        if (!isMaster) {
            return isAuthed && myProfile.data
                ? effectivePlanFromMasterProfile(unwrapEnvelope(myProfile.data))
                : 'BASIC';
        }
        if (isRecord(rawTariff) && rawTariff.tariffType != null) {
            const expired = rawTariff.isExpired === true;
            const type = rawTariff.tariffType;
            if (expired) return 'BASIC';
            return isPlan(type) ? type : 'BASIC';
        }
        return myProfile.data
            ? effectivePlanFromMasterProfile(unwrapEnvelope(myProfile.data))
            : 'BASIC';
    })();



    const onBuy = async (tariffType: PaidTariff) => {
        if (!isAuthed) {
            nav('/register');
            return;
        }
        if (!myMasterId) {
            toast.error(t('plans.profileNotLoaded'));
            return;
        }
        // Верифицированные мастера получают тариф бесплатно 1 кликом (без оплаты)
        if (isMaster && isVerified) {
            try {
                await claimFreePlan({ tariffType }).unwrap();
                toast.success(t('plans.claimFreeSuccess', { plan: tariffType }));
                myProfile.refetch();
                myTariff.refetch();
            } catch (e: unknown) {
                toast.error(toErrorMessage(e) ?? t('plans.claimFreeFailed'));
            }
            return;
        }
        // Неверифицированные мастера — направляем на верификацию (способы оплаты скрыты)
        if (isMaster && !isVerified) {
            nav('/dashboard/verification');
            toast(t('plans.verifyFirstToGetFree'), { icon: 'ℹ️' });
            return;
        }
        nav(`/plans/checkout?plan=${tariffType}`);
    };

    const onConfirmPendingUpgrade = () => {
        const plan = pendingUpgradeTo ? `&plan=${encodeURIComponent(pendingUpgradeTo)}` : '';
        nav(`/plans/checkout?pending=1${plan}`);
    };

    const onCancelPendingUpgrade = async () => {
        try {
            await cancelPendingUpgrade().unwrap();
            toast.success(t('plans.upgradeCancelled'));
            myTariff.refetch();
        } catch (e: unknown) {
            toast.error(toErrorMessage(e) ?? t('plans.cancelFailed'));
        }
    };

    const onCancelTariffAtPeriodEnd = async () => {
        try {
            await cancelTariffAtPeriodEnd().unwrap();
            toast.success(t('plans.cancelAtPeriodEndSuccess'));
            myTariff.refetch();
        } catch (e: unknown) {
            toast.error(toErrorMessage(e) ?? t('plans.cancelFailed'));
        }
    };

    const dbPlans = useMemo((): PlanUI[] => {
        const payload = unwrapEnvelope(tariffsData);
        const tariffsArray = Array.isArray(payload) ? payload : [];
        if (!tariffsArray || tariffsArray.length === 0) return [...plans];

        const tariffPlans: PlanUI[] = tariffsArray
            .map((t): PlanUI | null => {
                if (!isRecord(t)) return null;
                const type = t.type;
                if (type !== 'BASIC' && type !== 'VIP' && type !== 'PREMIUM') return null;

                const staticPlan = plans.find((p) => p.name === type);
                const features = Array.isArray(t.features) ? t.features.filter((x) => typeof x === 'string') : [];
            return {
                name: type,
                price: typeof t.price === 'string' ? t.price : staticPlan?.price ?? '',
                description: typeof t.description === 'string' ? t.description : (staticPlan?.description ?? ''),
                features,
                highlight: type === 'VIP',
                tariffType: type === 'BASIC' ? null : (type as PaidTariff),
                icon: staticPlan?.icon || null,
            };
            })
            .filter((x): x is PlanUI => Boolean(x));

        const hasBasic = tariffPlans.some((p) => p.name === 'BASIC');
        if (!hasBasic) {
            const basicPlan = plans.find((p) => p.name === 'BASIC') || {
                name: 'BASIC' as const,
                price: '0 MDL',
                description: 'Start and receive first requests',
                features: ['Public profile', 'Up to 5 photos', 'Receive requests', 'Reviews'],
                highlight: false,
                tariffType: null,
                icon: null,
            };
            tariffPlans.push(basicPlan);
        }

        return tariffPlans.sort((a, b) => {
            const order: Record<string, number> = { BASIC: 0, VIP: 1, PREMIUM: 2 };
            return (order[a.name] || 0) - (order[b.name] || 0);
        });
    }, [tariffsData]);

    const plansToShow = isMaster
        ? dbPlans.filter((p) => {
            if (p.name === effectivePlan) return true;
            if (effectivePlan === 'BASIC' && (p.name === 'VIP' || p.name === 'PREMIUM')) return true;
            // VIP masters always see PREMIUM upgrade option
            if (effectivePlan === 'VIP' && p.name === 'PREMIUM') return true;
            return false;
        })
        : dbPlans;

    return {
        isAuthed,
        isClient,
        isMaster,
        isVerified,
        effectivePlan,
        tariffExpiresAt,
        isExpired,
        pendingUpgrade,
        plansToShow,
        isLoading:
            (isMaster && (myProfile.isLoading || myTariff.isLoading)) ||
            tariffsLoading,
        checkoutLoading: false,
        claimLoading: claimState.isLoading,
        confirmLoading: false,
        cancelLoading: cancelState.isLoading,
        cancelAtPeriodEnd,
        cancelAtPeriodEndLoading: cancelAtPeriodEndState.isLoading,
        onCancelTariffAtPeriodEnd,
        onBuy,
        onConfirmPendingUpgrade,
        onCancelPendingUpgrade,
    };
}
