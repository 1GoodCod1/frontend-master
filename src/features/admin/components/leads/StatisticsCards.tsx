import { Target, Sparkles, Hourglass, CheckCircle } from 'lucide-react';
import { AdminStatCard } from '@/features/admin/components/common/AdminStatCard';

interface StatisticsCardsProps {
  totalLeads: number;
  newLeads: number;
  inProgressLeads: number;
  closedLeads: number;
}

export default function StatisticsCards({
  totalLeads,
  newLeads,
  inProgressLeads,
  closedLeads,
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <AdminStatCard staggerIndex={0} value={totalLeads}
        label="Total"
        icon={<Target className="size-6" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10"
      />
      <AdminStatCard staggerIndex={1} value={newLeads}
        label="New"
        icon={<Sparkles className="size-6" />}
        iconBgClassName="bg-emerald-600"
        cardClassName="border-emerald-500/20 bg-emerald-500/10"
      />
      <AdminStatCard staggerIndex={2} value={inProgressLeads}
        label="In progress"
        icon={<Hourglass className="size-6" />}
        iconBgClassName="bg-amber-500"
        cardClassName="border-amber-500/20 bg-amber-500/10"
      />
      <AdminStatCard staggerIndex={3} value={closedLeads}
        label="Closed"
        icon={<CheckCircle className="size-6" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.03]"
      />
    </div>
  );
}
