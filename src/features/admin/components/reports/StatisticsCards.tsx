import { AlertTriangle, Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import { AdminStatCard } from '@/features/admin/components/common/AdminStatCard';

interface StatisticsCardsProps {
  totalReports: number;
  pendingReports: number;
  reviewedReports: number;
  resolvedReports: number;
  rejectedReports: number;
}

export default function StatisticsCards({
  totalReports,
  pendingReports,
  reviewedReports,
  resolvedReports,
  rejectedReports,
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <AdminStatCard staggerIndex={0} value={totalReports} label="Total" icon={<AlertTriangle className="size-6" />} iconBgClassName="bg-red-600 dark:bg-red-500" cardClassName="border-slate-200 dark:border-white/[0.08] border-destructive/20 bg-destructive/10" />
      <AdminStatCard staggerIndex={1} value={pendingReports}
        label="Pending"
        icon={<Clock className="size-6" />}
        iconBgClassName="bg-amber-500"
        cardClassName="border-amber-500/20 bg-amber-500/10" />
      <AdminStatCard staggerIndex={2} value={reviewedReports}
        label="Reviewed"
        icon={<Eye className="size-6" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-slate-500/20 bg-slate-500/10" />
      <AdminStatCard staggerIndex={3} value={resolvedReports}
        label="Resolved"
        icon={<CheckCircle className="size-6" />}
        iconBgClassName="bg-emerald-600"
        cardClassName="border-emerald-500/20 bg-emerald-500/10" />
      <AdminStatCard staggerIndex={4} value={rejectedReports}
        label="Rejected"
        icon={<XCircle className="size-6" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-slate-500/20 bg-slate-500/10" />
    </div>
  );
}
