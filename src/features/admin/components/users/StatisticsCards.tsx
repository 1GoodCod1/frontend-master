import { useTranslation } from 'react-i18next';
import { Users, ShieldCheck, UserPlus, UserX } from 'lucide-react';
import { AdminStatCard } from '@/features/admin/components/common/AdminStatCard';

interface StatisticsCardsProps {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  blockedUsers: number;
}

export default function StatisticsCards({
  totalUsers,
  activeUsers,
  pendingUsers,
  blockedUsers,
}: StatisticsCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <AdminStatCard staggerIndex={0} value={totalUsers} label={t('admin.users.totalUsers')} icon={<Users className="size-7" />} iconBgClassName="bg-slate-600 dark:bg-slate-500" cardClassName="border-slate-200 dark:border-white/[0.08] border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10" />
      <AdminStatCard staggerIndex={1} value={activeUsers} label={t('admin.users.activeUsers')} icon={<ShieldCheck className="size-7" />} iconBgClassName="bg-emerald-600 dark:bg-emerald-500" cardClassName="border-slate-200 dark:border-white/[0.08] border-emerald-500/20 bg-emerald-500/10" />
      <AdminStatCard staggerIndex={2} value={pendingUsers} label="Pending" icon={<UserPlus className="size-7" />} iconBgClassName="bg-amber-600 dark:bg-amber-500" cardClassName="border-slate-200 dark:border-white/[0.08] border-amber-500/20 bg-amber-500/10" />
      <AdminStatCard staggerIndex={3} value={blockedUsers} label={t('admin.users.blockedUsers')} icon={<UserX className="size-7" />} iconBgClassName="bg-red-600 dark:bg-red-500" cardClassName="border-slate-200 dark:border-white/[0.08] border-destructive/20 bg-destructive/10" />
    </div>
  );
}
