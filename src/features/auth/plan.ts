import { isRecord } from '@/utils/guards';

export type TariffPlan = 'BASIC' | 'PLUS' | 'PRO';
export type PaidTariff = Exclude<TariffPlan, 'BASIC'>; // 'PLUS' | 'PRO'

export const PLAN_RANK: Record<TariffPlan, number> = {
  BASIC: 1,
  PLUS: 2,
  PRO: 3,
};

export function normalizeTariffPlan(raw: unknown): TariffPlan {
  if (raw === 'BASIC' || raw === 'PLUS' || raw === 'PRO') return raw;
  return 'BASIC';
}

export function isPlan(x: unknown): x is TariffPlan {
  return x === 'BASIC' || x === 'PLUS' || x === 'PRO';
}

export function hasMinPlan(current: TariffPlan, min: TariffPlan): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[min];
}

export function effectivePlanFromMasterProfile(mp: unknown): TariffPlan {
  if (!isRecord(mp)) return 'BASIC';
  const raw = mp.tariffType ?? mp.plan ?? mp.tariff ?? 'BASIC';
  const plan: TariffPlan = normalizeTariffPlan(raw);

  if (plan === 'BASIC') return 'BASIC';

  const expRaw = mp.tariffExpiresAt ?? mp.planExpiresAt ?? null;
  if (
    expRaw === null ||
    expRaw === undefined ||
    (typeof expRaw !== 'string' && typeof expRaw !== 'number' && !(expRaw instanceof Date))
  ) {
    return 'BASIC';
  }
  const exp = new Date(expRaw);

  if (!exp) return 'BASIC';
  if (Number.isNaN(exp.getTime())) return 'BASIC';
  if (exp.getTime() <= Date.now()) return 'BASIC';

  return plan;
}

export function effectivePlanFromMe(me: unknown): TariffPlan | null {
  if (!me) return null;
  if (!isRecord(me)) return null;
  const mp = me.masterProfile ?? me.master ?? null;
  if (!mp) return 'BASIC';
  return effectivePlanFromMasterProfile(mp);
}

export const PHOTO_LIMIT_BY_PLAN: Record<TariffPlan, number> = {
  BASIC: 5,
  PLUS: 10,
  PRO: 15,
};

export function maxPhotosForPlan(plan: TariffPlan): number {
  return PHOTO_LIMIT_BY_PLAN[plan];
}
