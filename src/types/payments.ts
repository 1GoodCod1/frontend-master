export const PAYMENT_STATUS_OPTIONS = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS_OPTIONS)[number];
export type PaymentFilterStatus = PaymentStatus | 'ALL';

export type PaymentDto = {
  id: string;
  tariffType?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  status?: PaymentStatus | string | null;
  paidAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  masterId?: string | null;
  master?: unknown;
} & Record<string, unknown>;

export interface PlanCardProps {
  plan: unknown;
  onSelect?: () => void;
  highlighted?: boolean;
}

export interface PlansAlertsProps {
  onUpgrade?: () => void;
}

export interface PaymentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  paymentId: string | null;
}

export interface PaymentsEmptyStateProps {
  onReset?: () => void;
}

export interface PaymentsFiltersProps {
  status: string;
  setStatus: (s: string) => void;
}

export interface StatisticsCardsPaymentsProps {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  totalRevenue?: number;
}
