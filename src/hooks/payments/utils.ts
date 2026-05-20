import type { PaidTariff } from '@/features/auth/plan';
import { unwrapEnvelope } from '@/utils/data';
import { isRecord } from '@/utils/guards';

export const VALID_PLANS: PaidTariff[] = ['PLUS', 'PRO'];

export function getPlanFromSearchParams(searchParams: URLSearchParams): PaidTariff | null {
  const plan = searchParams.get('plan')?.toUpperCase();
  if (plan === 'PLUS' || plan === 'PRO') return plan;
  return null;
}

export function getIsPendingFromSearchParams(searchParams: URLSearchParams): boolean {
  return searchParams.get('pending') === '1';
}

export function getMasterIdFromProfile(raw: unknown): string | null {
  const u = unwrapEnvelope(raw);
  if (!isRecord(u)) return null;
  if (typeof u.id === 'string' && u.id) return u.id;
  if (isRecord(u.master) && typeof u.master.id === 'string' && u.master.id) return u.master.id;
  return null;
}

export function getPaymentErrorMessage(e: unknown): string | null {
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
