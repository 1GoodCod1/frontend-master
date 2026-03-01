import { MessageSquare, Clock, Eye, EyeOff, Flag } from 'lucide-react';
import { AdminStatCard } from '@/components/admin/common/AdminStatCard';

interface StatisticsCardsProps {
  totalReviews: number;
  pendingReviews: number;
  visibleReviews: number;
  hiddenReviews: number;
  reportedReviews: number;
}

export default function StatisticsCards({
  totalReviews,
  pendingReviews,
  visibleReviews,
  hiddenReviews,
  reportedReviews,
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <AdminStatCard staggerIndex={0} value={totalReviews}
        label="Total"
        icon={<MessageSquare className="size-6" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-slate-500/20 bg-slate-500/10" />
      <AdminStatCard staggerIndex={1} value={pendingReviews}
        label="Pending"
        icon={<Clock className="size-6" />}
        iconBgClassName="bg-amber-500"
        cardClassName="border-amber-500/20 bg-amber-500/10" />
      <AdminStatCard staggerIndex={2} value={visibleReviews}
        label="Visible"
        icon={<Eye className="size-6" />}
        iconBgClassName="bg-emerald-600"
        cardClassName="border-emerald-500/20 bg-emerald-500/10" />
      <AdminStatCard staggerIndex={3} value={hiddenReviews}
        label="Hidden"
        icon={<EyeOff className="size-6" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-slate-500/20 bg-slate-500/10" />
      <AdminStatCard staggerIndex={4} value={reportedReviews} label="Reported" icon={<Flag className="size-6" />} iconBgClassName="bg-red-600 dark:bg-red-500" cardClassName="border-slate-200 dark:border-white/[0.08] border-destructive/20 bg-destructive/10" />
    </div>
  );
}
