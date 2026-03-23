import { safeStorage } from '@/utils/safeStorage';

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------
export const TRACKING_KEYS = {
  utmSource: 'mh_utm_source',
  utmMedium: 'mh_utm_medium',
  utmCampaign: 'mh_utm_campaign',
  firstVisit: 'mh_first_visit',
  visitCount: 'mh_visit_count',
  recentViews: 'mh_recent_views',
  viewMode: 'mh_view_mode',
} as const;

// ---------------------------------------------------------------------------
// UTM tracking
// ---------------------------------------------------------------------------
export type UtmParams = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
};

/**
 * Capture UTM params from the current URL and persist them.
 * Only overwrites if at least one utm_* param is present.
 */
export function captureUtmParams(): void {
  try {
    const url = new URL(window.location.href);
    const source = url.searchParams.get('utm_source');
    const medium = url.searchParams.get('utm_medium');
    const campaign = url.searchParams.get('utm_campaign');

    if (!source && !medium && !campaign) return;

    if (source) safeStorage.setItem(TRACKING_KEYS.utmSource, source);
    if (medium) safeStorage.setItem(TRACKING_KEYS.utmMedium, medium);
    if (campaign) safeStorage.setItem(TRACKING_KEYS.utmCampaign, campaign);
  } catch {
    // ignore
  }
}

export function getUtmParams(): UtmParams {
  return {
    source: safeStorage.getItem(TRACKING_KEYS.utmSource),
    medium: safeStorage.getItem(TRACKING_KEYS.utmMedium),
    campaign: safeStorage.getItem(TRACKING_KEYS.utmCampaign),
  };
}

export function clearUtmParams(): void {
  safeStorage.removeItem(TRACKING_KEYS.utmSource);
  safeStorage.removeItem(TRACKING_KEYS.utmMedium);
  safeStorage.removeItem(TRACKING_KEYS.utmCampaign);
}

// ---------------------------------------------------------------------------
// Visitor tracking (first visit + visit count)
// ---------------------------------------------------------------------------
export type VisitorInfo = {
  firstVisit: string | null;
  visitCount: number;
  isReturning: boolean;
};

/**
 * Record a visit. Call once on app startup.
 * Stores first-visit ISO timestamp and increments the visit counter.
 */
export function trackVisit(): void {
  try {
    const existing = safeStorage.getItem(TRACKING_KEYS.firstVisit);
    if (!existing) {
      safeStorage.setItem(TRACKING_KEYS.firstVisit, new Date().toISOString());
    }

    const raw = safeStorage.getItem(TRACKING_KEYS.visitCount);
    const count = raw ? parseInt(raw, 10) : 0;
    safeStorage.setItem(TRACKING_KEYS.visitCount, String((isNaN(count) ? 0 : count) + 1));
  } catch {
    // ignore
  }
}

export function getVisitorInfo(): VisitorInfo {
  const firstVisit = safeStorage.getItem(TRACKING_KEYS.firstVisit);
  const raw = safeStorage.getItem(TRACKING_KEYS.visitCount);
  const visitCount = raw ? parseInt(raw, 10) || 0 : 0;
  return {
    firstVisit,
    visitCount,
    isReturning: visitCount > 1,
  };
}

export function clearVisitorInfo(): void {
  safeStorage.removeItem(TRACKING_KEYS.firstVisit);
  safeStorage.removeItem(TRACKING_KEYS.visitCount);
}

// ---------------------------------------------------------------------------
// Recently viewed masters (client-side, works for all users)
// ---------------------------------------------------------------------------
const MAX_RECENT_VIEWS = 20;

export function trackRecentView(masterId: string): void {
  try {
    const ids = getRecentViews();
    const filtered = ids.filter((id) => id !== masterId);
    filtered.unshift(masterId);
    if (filtered.length > MAX_RECENT_VIEWS) filtered.length = MAX_RECENT_VIEWS;
    safeStorage.setItem(TRACKING_KEYS.recentViews, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function getRecentViews(): string[] {
  try {
    const raw = safeStorage.getItem(TRACKING_KEYS.recentViews);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function clearRecentViews(): void {
  safeStorage.removeItem(TRACKING_KEYS.recentViews);
}

// ---------------------------------------------------------------------------
// View mode (list / map) — functional preference, no consent needed
// ---------------------------------------------------------------------------
export type ViewMode = 'list' | 'map';

export function getPersistedViewMode(): ViewMode {
  const v = safeStorage.getItem(TRACKING_KEYS.viewMode);
  return v === 'map' ? 'map' : 'list';
}

export function setPersistedViewMode(mode: ViewMode): void {
  safeStorage.setItem(TRACKING_KEYS.viewMode, mode);
}

// ---------------------------------------------------------------------------
// Init — call once on app startup
// ---------------------------------------------------------------------------
export function initTracking(hasAnalyticsConsent: boolean): void {
  if (hasAnalyticsConsent) {
    captureUtmParams();
    trackVisit();
  }
}
