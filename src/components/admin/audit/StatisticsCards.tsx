import { useTranslation } from 'react-i18next';
import { Shield, History, Monitor } from 'lucide-react';
import { AdminStatCard } from '@/components/admin/common/AdminStatCard';

interface StatisticsCardsProps {
  totalLogs: number;
  currentPage: number;
  perPage: number;
}

export default function StatisticsCards({
  totalLogs,
  currentPage,
  perPage,
}: StatisticsCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <AdminStatCard staggerIndex={0} value={totalLogs}
        label={t('admin.audit.totalLogs')}
        icon={<Shield className="size-7" />}
        iconBgClassName="bg-primary"
        cardClassName="border-primary/20 bg-primary/5"
      />
      <AdminStatCard staggerIndex={1} value={currentPage}
        label={t('admin.audit.currentPage')}
        icon={<History className="size-7" />}
        iconBgClassName="bg-emerald-600"
        cardClassName="border-emerald-500/20 bg-emerald-500/10"
      />
      <AdminStatCard staggerIndex={2} value={perPage}
        label={t('admin.audit.perPage')}
        icon={<Monitor className="size-7" />}
        iconBgClassName="bg-muted-foreground"
        cardClassName="border-border bg-muted/30"
      />
    </div>
  );
}
