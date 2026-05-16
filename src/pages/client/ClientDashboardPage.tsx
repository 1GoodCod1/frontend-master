import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Heart, Mail, AlertTriangle, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RecentlyViewed } from '@/components/home/recommendations/RecentlyViewed';
import { RecommendedMasters } from '@/components/home/recommendations/RecommendedMasters';
import { useClientDashboard, type ClientBooking, type ClientLead } from '@/hooks/client/dashboard';
import { useNow } from '@/hooks/useNow';
import DashboardMetricCard from '@/features/clients/components/dashboard/DashboardMetricCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { PushPermissionBanner } from '@/components/notifications/PushPermissionBanner';
import { PendingBookingsBanner } from '@/features/bookings/components/PendingBookingsBanner';

const iconClass = 'size-5';

/** Shared block surface — matches the homepage cards (visible contour in both themes). */
const CARD_SURFACE =
  'bg-[#F9FAFB] border border-gray-200/80 shadow-sm dark:bg-white/[0.06] dark:border-white/[0.08] dark:shadow-lg dark:shadow-black/20';
const CARD_HOVER =
  'transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/10 dark:hover:border-white/[0.14]';

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
  const { bookingsCount, favoritesCount, leadsCount, bookingsList, leadsList, reviewsList } = useClientDashboard();

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

  /** Мастера, по которым клиент уже оставил отзыв (из GET /reviews/my-reviews). */
  const reviewedMasterIds = useMemo(() => {
    const set = new Set<string>();
    for (const r of reviewsList || []) {
      if (typeof r.masterId === 'string' && r.masterId) set.add(r.masterId);
    }
    return set;
  }, [reviewsList]);

  /**
   * Напоминание «оставить отзыв», если выполняется хотя бы одно:
   * — запись в статусе COMPLETED, или
   * — заявка в статусе CLOSED.
   * На одного мастера — одна карточка; уже оставленные отзывы исключаем.
   */
  const pendingReviews = useMemo(() => {
    type Row = { id: string; masterId: string; master: ClientBooking['master'] };
    const rows: Row[] = [];
    const seenMaster = new Set<string>();

    const push = (item: ClientBooking | ClientLead, keyPrefix: 'booking' | 'lead') => {
      const mid = item.masterId;
      if (!mid || reviewedMasterIds.has(mid) || seenMaster.has(mid)) return;
      if ('isReviewed' in item && item.isReviewed === true) return;
      seenMaster.add(mid);
      rows.push({
        id: `${keyPrefix}-${item.id}`,
        masterId: mid,
        master: item.master ?? null,
      });
    };

    for (const b of bookingsList || []) {
      if (b.status === 'COMPLETED') push(b, 'booking');
    }
    for (const l of leadsList || []) {
      if (l.status === 'CLOSED') push(l, 'lead');
    }

    return rows;
  }, [bookingsList, leadsList, reviewedMasterIds]);

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardMetricCard
          to="/client-dashboard/bookings"
          icon={<Calendar className={iconClass} />}
          value={bookingsCount}
          label={t('clientDashboard.bookings')}
          description={t('clientDashboard.bookingsDescription')}
          accent="blue"
        />
        <DashboardMetricCard
          to="/client-dashboard/favorites"
          icon={<Heart className={iconClass} />}
          value={favoritesCount}
          label={t('clientDashboard.favorites')}
          description={t('clientDashboard.favoritesDescription')}
          accent="rose"
        />
        <DashboardMetricCard
          to="/client-dashboard/leads"
          icon={<Mail className={iconClass} />}
          value={leadsCount}
          label={t('clientDashboard.myLeads')}
          description={t('clientDashboard.leadsDescription')}
          accent="violet"
        />
        <DashboardMetricCard
          to="/client-dashboard/reports"
          icon={<AlertTriangle className={iconClass} />}
          value="—"
          label={t('clientDashboard.reports')}
          description={t('clientDashboard.reportsDescription')}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="min-w-0 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{t('clientDashboard.timeline')}</h3>
          </div>
          <div className="relative space-y-3 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border/40">
            {timelineItems.length > 0 ? timelineItems.map((item) => {
              const dotColor = item.type === 'BOOKING'
                ? 'bg-teal-500'
                : item.type === 'LEAD'
                  ? 'bg-amber-500'
                  : 'bg-violet-500';
              const labelColor = item.type === 'BOOKING'
                ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10'
                : item.type === 'LEAD'
                  ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                  : 'text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10';
              return (
                <div key={item.id} className="relative flex items-start gap-5 pl-5">
                  <div className={cn(
                    'absolute left-[7px] top-5 size-2.5 -translate-x-1/2 rounded-full ring-4 ring-background',
                    dotColor,
                  )} />
                  <div className={cn('flex-1 rounded-xl p-4', CARD_SURFACE, CARD_HOVER)}>
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
              <div className={cn('flex min-h-[220px] items-center justify-center rounded-xl text-center', CARD_SURFACE)}>
                <p className="text-sm text-muted-foreground">{t('clientDashboard.noHistory')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Reminders & Recommendations */}
        <div className="min-w-0 space-y-8">
          {/* Reminders */}
          {(pendingReviews.length > 0 || upcomingBookings.length > 0) && (
            <div className={cn('rounded-2xl p-6', CARD_SURFACE)}>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  <AlertTriangle className="size-4" />
                </span>
                <h4 className="text-sm font-bold text-foreground">{t('clientDashboard.reminders')}</h4>
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
          <RecentlyViewed
            limit={4}
            layout="sidebar"
            title={t('clientDashboard.recentlyViewed')}
            subtitle={t('clientDashboard.recentlyViewedSubtitle')}
          />
        </div>
      </div>

      <div className="pt-4">
        <RecommendedMasters limit={4} title={t('clientDashboard.recommendedForYou')} />
      </div>
    </div>
  );
}
