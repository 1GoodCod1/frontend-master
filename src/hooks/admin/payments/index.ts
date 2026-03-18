export type AdminPaymentRow = {
  id: string;
  status?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  tariffType?: string | null;
  plan?: string | null;
  type?: string | null;
  createdAt?: string | null;
  master?: { user?: { firstName?: string | null; lastName?: string | null } | null } | null;
} & Record<string, unknown>;

export { useAdminPayments } from './useAdminPayments';
