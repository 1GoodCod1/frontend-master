import { useTranslation } from 'react-i18next';
import { User, ClipboardList, CreditCard } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { useAdminDashboardQuery } from '@/features/admin/adminApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { MetricCards } from '@/components/ui/MetricCards';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useIsDark } from '@/hooks/useIsDark';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { getRoleColor } from '@/utils/user';

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation();
  const isDark = useIsDark();
  const locale = getLocaleFromLanguage(i18n.language);
  const q = useAdminDashboardQuery();

  if (q.isLoading) return <LoadingState />;
  if (q.isError) return <ErrorState error={q.error as Error} onRetry={q.refetch} />;

  const data = (q.data as { data?: Record<string, unknown> })?.data ?? (q.data as Record<string, unknown>);
  const recent = (data?.recent as Record<string, unknown[]>) ?? {};
  const formatDate = (date: string | Date) => formatDateTimeString(date, locale);

  const cardBase = 'rounded-lg border border-border dark:border-white/[0.08] bg-card p-4 transition-colors hover:bg-muted/30 hover:border-amber-500/30';

  return (
    <>
      <PageHeader title={t('admin.dashboard.title')} subtitle={t('admin.dashboard.subtitle')} />
      <SectionCard title={t('admin.dashboard.keyMetrics')}>
        <MetricCards data={data} />
      </SectionCard>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {recent.users && (recent.users as unknown[]).length > 0 && (
          <SectionCard title={t('admin.dashboard.recentUsers')}>
            <div className="space-y-3">
              {(recent.users as { id: string; email?: string; phone?: string; role?: string; isVerified?: boolean }[]).slice(0, 5).map((user) => (
                <div key={user.id} className={cardBase}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar className="size-10 shrink-0">
                        <AvatarFallback className="text-sm text-white" style={{ backgroundColor: getRoleColor(user.role ?? '', isDark) }}>
                          {user.email?.[0]?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.phone || t('admin.dashboard.noPhone')}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Badge className="text-[10px] font-semibold text-white" style={{ backgroundColor: getRoleColor(user.role ?? '', isDark) }}>
                        {t(`admin.roles.${user.role}`) || user.role}
                      </Badge>
                      {user.isVerified && (
                        <Badge className="size-6 rounded-full p-0 text-xs text-white" style={{ backgroundColor: isDark ? '#ff8a50' : '#4A90E2' }}>
                          ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {recent.masters && (recent.masters as unknown[]).length > 0 && (
          <SectionCard title={t('admin.dashboard.recentMasters')}>
            <div className="space-y-3">
              {(recent.masters as { id: string; slug?: string; user?: { firstName?: string; lastName?: string }; category?: { name: string }; city?: { name: string }; tariffType?: string }[]).slice(0, 5).map((master) => (
                <RouterLink
                  key={master.id}
                  to={`/masters/${master.slug || master.id}`}
                  className={`${cardBase} flex items-center justify-between gap-3 no-underline text-foreground hover:border-amber-500/50`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="size-10 shrink-0 bg-primary/80">
                      <AvatarFallback className="text-white">
                        <User className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{master.user?.firstName} {master.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{master.category?.name} • {master.city?.name}</p>
                    </div>
                  </div>
                  {master.tariffType && master.tariffType !== 'BASIC' && (
                    <Badge className="shrink-0 bg-red-600 text-[10px] font-semibold text-white">
                      {t(`common.masterCard.${String(master.tariffType).toLowerCase()}`)}
                    </Badge>
                  )}
                </RouterLink>
              ))}
            </div>
          </SectionCard>
        )}

        {recent.leads && (recent.leads as unknown[]).length > 0 && (
          <SectionCard title={t('admin.dashboard.recentLeads')}>
            <div className="space-y-3">
              {(recent.leads as { id: string; clientName?: string; clientPhone?: string; message?: string; status?: string; createdAt?: string }[]).slice(0, 5).map((lead) => (
                <div key={lead.id} className={cardBase}>
                  <div className="flex gap-3">
                    <ClipboardList className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-500" />
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-sm font-semibold">{lead.clientName || lead.clientPhone}</p>
                      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{lead.message?.substring(0, 60)}...</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className="text-[10px] font-semibold text-white"
                          style={{
                            backgroundColor: lead.status === 'NEW' ? (isDark ? '#ff8a50' : '#4A90E2') : lead.status === 'IN_PROGRESS' ? '#FFB800' : '#27AE60',
                          }}
                        >
                          {lead.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(lead.createdAt ?? '')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {recent.payments && (recent.payments as unknown[]).length > 0 && (
          <SectionCard title={t('admin.dashboard.recentPayments')}>
            <div className="space-y-3">
              {(recent.payments as { id: string; tariffType?: string; plan?: string; amount?: number; currency?: string; status?: string; createdAt?: string; paidAt?: string }[]).slice(0, 5).map((payment) => (
                <div key={payment.id} className={cardBase}>
                  <div className="flex gap-3">
                    <CreditCard className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{payment.tariffType || payment.plan || t('admin.dashboard.payment')}</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-primary">
                          {payment.amount} {payment.currency || 'MDL'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className="text-[10px] font-semibold text-white"
                          style={{
                            backgroundColor: payment.status === 'SUCCESS' ? '#27AE60' : payment.status === 'PENDING' ? '#FFB800' : '#DC143C',
                          }}
                        >
                          {payment.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(payment.createdAt || payment.paidAt || '')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </>
  );
}
