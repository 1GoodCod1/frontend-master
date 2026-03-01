export type TariffPlan = 'BASIC' | 'VIP' | 'PREMIUM';
export type PaidTariff = Exclude<TariffPlan, 'BASIC'>; // 'VIP' | 'PREMIUM'

export const PLAN_RANK: Record<TariffPlan, number> = {
  BASIC: 1,
  VIP: 2,
  PREMIUM: 3,
};

export function isPlan(x: unknown): x is TariffPlan {
  return x === 'BASIC' || x === 'VIP' || x === 'PREMIUM';
}

export function hasMinPlan(current: TariffPlan, min: TariffPlan): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[min];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function effectivePlanFromMasterProfile(mp: unknown): TariffPlan {
  if (!isRecord(mp)) return 'BASIC';
  const raw = mp.tariffType ?? mp.plan ?? mp.tariff ?? 'BASIC';
  const plan: TariffPlan = isPlan(raw) ? raw : 'BASIC';

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
  VIP: 10,
  PREMIUM: 15,
};

export function maxPhotosForPlan(plan: TariffPlan): number {
  return PHOTO_LIMIT_BY_PLAN[plan];
}