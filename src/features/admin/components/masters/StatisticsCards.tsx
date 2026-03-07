import { useTranslation } from 'react-i18next';
import { Briefcase, ShieldCheck, Star, Users } from 'lucide-react';
import { AdminStatCard } from '@/features/admin/components/common/AdminStatCard';

interface StatisticsCardsProps {
  totalMasters: number;
  verifiedMasters: number;
  featuredMasters: number;
  avgRating: string;
}

export default function StatisticsCards({
  totalMasters,
  verifiedMasters,
  featuredMasters,
  avgRating,
}: StatisticsCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <AdminStatCard staggerIndex={0} value={totalMasters}
        label={t('admin.masters.totalMasters')}
        icon={<Briefcase className="size-7" />}
        iconBgClassName="bg-purple-600"
        cardClassName="border-purple-500/20 bg-purple-500/10"
      />
      <AdminStatCard staggerIndex={1} value={verifiedMasters} label={t('admin.masters.verifiedMasters')}
        icon={<ShieldCheck className="size-7" />}
        iconBgClassName="bg-emerald-600"
        cardClassName="border-emerald-500/20 bg-emerald-500/10"
      />
      <AdminStatCard staggerIndex={2} value={featuredMasters}
        label={t('admin.masters.featuredMasters')}
        icon={<Star className="size-7" />}
        iconBgClassName="bg-amber-500"
        cardClassName="border-amber-500/20 bg-amber-500/10"
      />
      <AdminStatCard staggerIndex={3} value={avgRating}
        label={t('admin.masters.avgRating')}
        icon={<Users className="size-7" />}
        iconBgClassName="bg-slate-600 dark:bg-slate-500"
        cardClassName="border-slate-200 dark:border-white/[0.08] border-slate-500/20 bg-slate-500/10"
      />
    </div>
  );
}
