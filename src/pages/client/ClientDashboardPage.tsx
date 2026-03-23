import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Heart, Mail, AlertTriangle, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RecentlyViewed } from '@/components/home/recommendations/RecentlyViewed';
import { RecommendedMasters } from '@/components/home/recommendations/RecommendedMasters';
import { useClientDashboard, type ClientBooking } from '@/hooks/client/dashboard';
import { useIsDark } from '@/hooks/useIsDark';
import { useNow } from '@/hooks/useNow';
import DashboardMetricCard from '@/features/clients/components/dashboard/DashboardMetricCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { PushPermissionBanner } from '@/components/notifications/PushPermissionBanner';
import { PendingBookingsBanner } from '@/features/bookings/components/PendingBookingsBanner';

const iconClass = 'size-7';

type TimelineItem =
  | {
    id: string;
    type: 'BOOKING';
    date: string;
    status?: string;
    masterId?: string;
    masterName: string;
  }
  | {
    id: string;
    type: 'LEAD';
    date: string;
    status?: string;
    masterId?: string;
    masterName: string;
  }
  | {
    id: string;
    type: 'REVIEW';
    date: string;
    status?: string;
    masterId?: string;
    masterName: string;
    rating?: number;
  };

const displayMasterName = (m?: { user?: { firstName?: string | null; lastName?: string | null } | null; name?: string | null } | null) => {
  const full = `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim();
  return full || m?.name || '—';
};

export default function ClientDashboardPage() {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const { bookingsCount, favoritesCount, leadsCount, bookingsList, leadsList, reviewsList } = useClientDashboard();

  const primaryBg = isDark ? 'rgba(255, 138, 80, 0.15)' : 'rgba(74, 144, 226, 0.1)';
  const primaryColor = isDark ? '#ff8a50' : '#4A90E2';
  const primaryShadow = isDark ? '0 4px 12px rgba(255, 138, 80, 0.2)' : '0 4px 12px rgba(74, 144, 226, 0.15)';
  const primaryHoverShadow = isDark ? '0 12px 32px rgba(255, 138, 80, 0.25)' : '0 12px 32px rgba(74, 144, 226, 0.2)';
  const amberBg = isDark ? 'rgba(255, 183, 77, 0.15)' : 'rgba(255, 167, 38, 0.1)';
  const amberColor = isDark ? '#ffb74d' : '#FFA726';
  const amberShadow = isDark ? '0 4px 12px rgba(255, 183, 77, 0.2)' : '0 4px 12px rgba(255, 167, 38, 0.15)';
  const amberHoverShadow = isDark ? '0 12px 32px rgba(255, 183, 77, 0.25)' : '0 12px 32px rgba(255, 167, 38, 0.2)';

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const bookings = (bookingsList || [])
      .map((b) => {
        const date = b.startTime || b.createdAt;
        if (!b.id || !date) return null;
        return {
          id: b.id,
          type: 'BOOKING' as const,
          date,
          status: b.status,
          masterId: b.masterId,
          masterName: displayMasterName(b.master ?? null),
        };
      })
      .filter(Boolean) as TimelineItem[];

    const leads = (leadsList || [])
      .map((l) => {
        if (!l.id || !l.createdAt) return null;
        return {
          id: l.id,
          type: 'LEAD' as const,
          date: l.createdAt,
          status: l.status,
          masterId: l.masterId,
          masterName: displayMasterName(l.master ?? null),
        };
      })
      .filter(Boolean) as TimelineItem[];

    const reviews = (reviewsList || [])
      .map((r) => {
        if (!r.id || !r.createdAt) return null;
        return {
          id: r.id,
          type: 'REVIEW' as const,
          date: r.createdAt,
          status: r.status,
          masterId: r.masterId,
          masterName: displayMasterName(r.master ?? null),
          rating: typeof r.rating === 'number' ? r.rating : undefined,
        };
      })
      .filter(Boolean) as TimelineItem[];

    return [...bookings, ...leads, ...reviews]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [bookingsList, leadsList, reviewsList]);

  const pendingReviews = useMemo(
    () => (bookingsList || []).filter((b) => b.status === 'COMPLETED' && !b.isReviewed),
    [bookingsList],
  );

  const now = useNow();
  const upcomingBookings = useMemo(() => {
    const horizon = now + 48 * 60 * 60 * 1000;
    type BookingWithWhen = ClientBooking & { _when: number };
    return (bookingsList || [])
      .map((b): BookingWithWhen | null => {
        const when = b.startTime ? new Date(b.startTime).getTime() : NaN;
        return Number.isFinite(when) ? ({ ...b, _when: when } as BookingWithWhen) : null;
      })
      .filter((b): b is BookingWithWhen => Boolean(b))
      .filter((b) => b._when > now && b._when < horizon && b.status === 'CONFIRMED')
      .slice(0, 3);
  }, [bookingsList, now]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 space-y-10">
      <PageHeader
        title={t('clientDashboard.title')}
        subtitle={t('clientDashboard.subtitle')}
      />
      <PushPermissionBanner />
      <PendingBookingsBanner />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {/* ... (Metrics stay same) */}
        <DashboardMetricCard
          to="/client-dashboard/bookings"
          icon={<Calendar className={iconClass} />}
          value={bookingsCount}
          label={t('clientDashboard.bookings')}
          description={t('clientDashboard.bookingsDescription')}
          iconBgColor={primaryBg}
          iconColor={primaryColor}
          iconBoxShadow={primaryShadow}
          hoverBorderColor={primaryColor}
          hoverBoxShadow={primaryHoverShadow}
        />
        <DashboardMetricCard
          to="/client-dashboard/favorites"
          icon={<Heart className={iconClass} />}
          value={favoritesCount}
          label={t('clientDashboard.favorites')}
          description={t('clientDashboard.favoritesDescription')}
          iconBgColor="rgba(220, 20, 60, 0.15)"
          iconColor="#DC143C"
          iconBoxShadow="0 4px 12px rgba(220, 20, 60, 0.2)"
          hoverBorderColor="#DC143C"
          hoverBoxShadow="0 12px 32px rgba(220, 20, 60, 0.25)"
        />
        <DashboardMetricCard
          to="/client-dashboard/leads"
          icon={<Mail className={iconClass} />}
          value={leadsCount}
          label={t('clientDashboard.myLeads')}
          description={t('clientDashboard.leadsDescription')}
          iconBgColor={primaryBg}
          iconColor={primaryColor}
          iconBoxShadow={primaryShadow}
          hoverBorderColor={primaryColor}
          hoverBoxShadow={primaryHoverShadow}
        />
        <DashboardMetricCard
          to="/client-dashboard/reports"
          icon={<AlertTriangle className={iconClass} />}
          value="—"
          label={t('clientDashboard.reports')}
          description={t('clientDashboard.reportsDescription')}
          iconBgColor={amberBg}
          iconColor={amberColor}
          iconBoxShadow={amberShadow}
          hoverBorderColor={amberColor}
          hoverBoxShadow={amberHoverShadow}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{t('clientDashboard.timeline')}</h3>
          </div>
          <div className="relative space-y-3 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/30 before:to-transparent">
            {timelineItems.length > 0 ? timelineItems.map((item) => {
              const dotColor = item.type === 'BOOKING'
                ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]'
                : item.type === 'LEAD'
                  ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]';
              const labelColor = item.type === 'BOOKING'
                ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10'
                : item.type === 'LEAD'
                  ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                  : 'text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10';
              return (
                <div key={item.id} className="relative flex items-start gap-6 pl-2">
                  <div className={cn(
                    "absolute left-5 top-5 -translate-x-1/2 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-[3px] ring-background",
                    dotColor
                  )} />
                  <div className="flex-1 rounded-xl border-0 bg-white dark:bg-white/[0.04] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:hover:bg-white/[0.07]">
                    <div className="flex justify-between items-center mb-2">
                      <span className={cn('text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md', labelColor)}>
                        {item.type === 'BOOKING'
                          ? t('clientDashboard.booking')
                          : item.type === 'LEAD'
                            ? t('clientDashboard.leadSource')
                            : t('clientDashboard.review')}
                      </span>
                      <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 dark:text-foreground/70">
                      {item.type === 'BOOKING'
                        ? t('clientDashboard.recordedTo')
                        : item.type === 'LEAD'
                          ? t('clientDashboard.sentLeadTo')
                          : t('clientDashboard.leftReviewFor')}
                      {' '}
                      <span className="font-semibold text-foreground/90 dark:text-foreground/85">{item.masterName}</span>
                      {item.type === 'REVIEW' && typeof item.rating === 'number' && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400/80">
                          <Star className="size-3.5 fill-amber-500 text-amber-500" />
                          {item.rating.toFixed(1)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-muted-foreground text-sm italic py-4">{t('clientDashboard.noHistory')}</p>
            )}
          </div>
        </div>

        {/* Sidebar: Reminders & Recommendations */}
        <div className="space-y-8">
          {/* Reminders */}
          {(pendingReviews.length > 0 || upcomingBookings.length > 0) && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 animate-pulse-slow">
              <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" />
                <h4 className="font-bold">{t('clientDashboard.reminders')}</h4>
              </div>
              <div className="space-y-4">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="text-sm">
                    <p className="leading-relaxed">
                      {t('clientDashboard.upcomingBooking')}
                      {' '}
                      <span className="font-bold">{displayMasterName(b.master ?? null)}</span>
                      {' '}
                      {b.startTime && (
                        <span className="text-muted-foreground">
                          ({new Date(b.startTime).toLocaleString()})
                        </span>
                      )}
                      .
                    </p>
                    <Button variant="link" className="p-0 h-auto text-amber-600 dark:text-amber-400 font-bold mt-2 h-7" asChild>
                      <a href="/client-dashboard/bookings">{t('clientDashboard.viewBookings')}</a>
                    </Button>
                  </div>
                ))}

                {pendingReviews.map((b) => (
                  <div key={b.id} className="text-sm">
                    <p className="leading-relaxed">
                      {t('clientDashboard.leaveReviewText')}
                      {' '}
                      <span className="font-bold">{displayMasterName(b.master ?? null)}</span>.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-amber-600 dark:text-amber-400 font-bold mt-2 h-7" asChild>
                      <a href={b.masterId ? `/masters/${b.masterId}#reviews` : '/'}>{t('clientDashboard.leaveReviewNow')}</a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          <div className="space-y-4">
            <RecentlyViewed
              limit={3}
              title={t('clientDashboard.recentlyViewed')}
              subtitle={t('clientDashboard.recentlyViewedSubtitle')}
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <RecommendedMasters limit={4} title={t('clientDashboard.recommendedForYou')} />
      </div>
    </div>
  );
}
