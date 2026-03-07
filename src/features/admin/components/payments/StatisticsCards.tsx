import { CreditCard, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';
import { AdminStatCard } from '@/features/admin/components/common/AdminStatCard';

interface StatisticsCardsProps {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
}

export default function StatisticsCards({
  totalPayments,
  paidPayments,
  pendingPayments,
  failedPayments,
  totalRevenue,
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <AdminStatCard staggerIndex={0} value={totalPayments}
        label="Total"
        icon={<CreditCard className="size-6" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-slate-500/20 bg-slate-500/10"
      />
      <AdminStatCard staggerIndex={1} value={paidPayments}
        label="Paid"
        icon={<CheckCircle className="size-6" />}
        iconBgClassName="bg-emerald-600"
        cardClassName="border-emerald-500/20 bg-emerald-500/10"
      />
      <AdminStatCard staggerIndex={2} value={pendingPayments}
        label="Pending"
        icon={<Clock className="size-6" />}
        iconBgClassName="bg-amber-500"
        cardClassName="border-amber-500/20 bg-amber-500/10"
      />
      <AdminStatCard staggerIndex={3} value={failedPayments}
        label="Failed"
        icon={<XCircle className="size-6" />}
        iconBgClassName="bg-red-600 dark:bg-red-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-destructive/20 bg-destructive/10"
      />
      <AdminStatCard staggerIndex={4} value={totalRevenue}
        label="Revenue"
        icon={<DollarSign className="size-6" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-slate-500/20 bg-slate-500/10"
      />
    </div>
  );
}
