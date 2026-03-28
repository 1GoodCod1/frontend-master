import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  User,
  ClipboardList,
  Star,
  CreditCard,
  UserPlus,
  Mail,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

const metricConfig: Record<
  string,
  { labelKey: string; icon: React.ReactNode; colorClass: string }
> = {
  totalUsers: { labelKey: 'totalUsers', icon: <Users className="size-5" />, colorClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  totalMasters: { labelKey: 'totalMasters', icon: <User className="size-5" />, colorClass: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  totalLeads: { labelKey: 'totalLeads', icon: <ClipboardList className="size-5" />, colorClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
  totalReviews: { labelKey: 'totalReviews', icon: <Star className="size-5" />, colorClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  totalPayments: { labelKey: 'totalPayments', icon: <CreditCard className="size-5" />, colorClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  newUsers: { labelKey: 'newUsersToday', icon: <UserPlus className="size-5" />, colorClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  newLeads: { labelKey: 'newLeadsToday', icon: <Mail className="size-5" />, colorClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
  newReviews: { labelKey: 'newReviewsToday', icon: <Star className="size-5" />, colorClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
};

function pickMetrics(obj: unknown): Array<{
  key: string;
  labelKey: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}> {
  if (!obj || typeof obj !== 'object') {
    return [];
  }
  const o = obj as Record<string, unknown>;
  const stats = (o.stats ?? o) as Record<string, unknown>;
  const database = (stats.database ?? {}) as Record<string, unknown>;
  const daily = (stats.daily ?? {}) as Record<string, unknown>;
  const metrics: Array<{ key: string; labelKey: string; value: number; icon: React.ReactNode; colorClass: string }> = [];

  const dbKeys = ['totalUsers', 'totalMasters', 'totalLeads', 'totalReviews', 'totalPayments'];
  for (const key of dbKeys) {
    const value = database[key];
    if (isFiniteNumber(value) && metricConfig[key]) {
      metrics.push({
        key,
        labelKey: metricConfig[key].labelKey,
        value,
        icon: metricConfig[key].icon,
        colorClass: metricConfig[key].colorClass,
      });
    }
  }

  const dailyKeys = ['newUsers', 'newLeads', 'newReviews'];
  for (const key of dailyKeys) {
    const value = daily[key];
    if (isFiniteNumber(value) && metricConfig[key]) {
      metrics.push({
        key,
        labelKey: metricConfig[key].labelKey,
        value,
        icon: metricConfig[key].icon,
        colorClass: metricConfig[key].colorClass,
      });
    }
  }

  return metrics.slice(0, 8);
}

export function MetricCards({ data }: { data: unknown }) {
  const { t } = useTranslation();
  const metrics = useMemo(() => pickMetrics(data), [data]);
  if (!metrics.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card
          key={m.key}
          className={cn(
            'border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:shadow-md'
          )}
        >
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-full',
                  m.colorClass
                )}
              >
                {m.icon}
              </span>
            </div>
            <p className="mb-1 text-xs text-muted-foreground">
              {t(`admin.system.${m.labelKey}`)}
            </p>
            <p className="text-xl font-bold text-foreground">
              {m.value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
