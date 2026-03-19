import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { mediaUrl } from '@/utils/media';
import { useNow } from '@/hooks/useNow';
import type { PublicMaster } from '@/types';

type TariffType = 'BASIC' | 'VIP' | 'PREMIUM';

function normalizeTariffType(v: unknown): TariffType {
  if (typeof v !== 'string') return 'BASIC';
  const x = v.toUpperCase();
  if (x === 'VIP' || x === 'PREMIUM' || x === 'BASIC') return x;
  return 'BASIC';
}

export function useMasterCardData(
  master: PublicMaster,
  promotionDiscountProp?: number,
) {
  const { t } = useTranslation();
  const now = useNow();

  const displayName =
    master?.displayName ||
    `${master?.user?.firstName || ''} ${master?.user?.lastName || ''}`.trim() ||
    master?.name ||
    t('common.masterCard.masterNameFallback');

  const city = getTranslatedCityName(t, master?.city) || master?.city?.name;
  const rating = master?.rating ?? master?.avgRating;
  const totalReviews = master?.totalReviews ?? 0;
  const categoryName = getTranslatedCategoryName(t, master?.category) || master?.category?.name;

  const avatarSrc = mediaUrl(master?.avatarUrl || master?.avatarFile?.path || null);

  const rawTariff = normalizeTariffType(
    master?.effectiveTariffType ??
      master?.tariffType ??
      (typeof master?.tariff === 'string' ? master.tariff : null) ??
      'BASIC'
  );
  const expRaw: unknown = master?.tariffExpiresAt ?? master?.planExpiresAt ?? null;
  const expMs =
    typeof expRaw === 'string' || expRaw instanceof Date
      ? new Date(expRaw).getTime()
      : 0;
  const isActivePaid = rawTariff !== 'BASIC' && !!expMs && expMs > now;
  const effectiveTariff: TariffType =
    rawTariff === 'BASIC' ? 'BASIC' : isActivePaid ? rawTariff : 'BASIC';

  const isVip = effectiveTariff === 'VIP';
  const isPremium = effectiveTariff === 'PREMIUM';
  const placeholderVariant: 'default' | 'vip' | 'premium' = isVip ? 'vip' : isPremium ? 'premium' : 'default';
  const isVerified = (master?.user?.isVerified ?? master?.isVerified) === true;

  const activePromotion = master?.activePromotion ?? master?.promotions?.[0] ?? null;
  const activePromotionDiscount =
    typeof promotionDiscountProp === 'number'
      ? promotionDiscountProp
      : typeof activePromotion?.discount === 'number'
        ? activePromotion.discount
        : null;

  const serviceTags = useMemo(() => {
    const svc = master.services ?? [];
    return svc.slice(0, 2).map((s) => s.title || '').filter(Boolean);
  }, [master.services]);

  return {
    displayName,
    city,
    rating,
    totalReviews,
    categoryName,
    avatarSrc,
    effectiveTariff,
    isVip,
    isPremium,
    placeholderVariant,
    isVerified,
    activePromotionDiscount,
    serviceTags,
  };
}
