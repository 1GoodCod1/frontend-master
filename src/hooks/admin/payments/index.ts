export type AdminPaymentRow = {
  id: string;
  status?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  tariffType?: string | null;
  plan?: string | null;
  type?: string | null;
  createdAt?: string | null;
  master?: {
    avatarUrl?: string | null;
    avatarFile?: { path?: string | null } | null;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      avatarFile?: { path?: string | null } | null;
    } | null;
  } | null;
} & Record<string, unknown>;

export { useAdminPayments } from './useAdminPayments';
