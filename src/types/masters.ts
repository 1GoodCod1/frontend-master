import type { MasterServiceItem } from './index';

export type WithSlugAndName = {
  slug?: string | null;
  name?: string | null;
} | null;

export type PublicFileRef = {
  path?: string | null;
} | null;

export type PublicUserRef = {
  firstName?: string | null;
  lastName?: string | null;
  isVerified?: boolean | null;
  /** Account-level avatar (fallback when master.avatarFile is empty) */
  avatarFile?: PublicFileRef;
} | null;

/**
 * Public master profile shape used across public pages (MasterDetails/MasterCard/etc).
 * Intentionally permissive for fields not yet strictly typed elsewhere.
 */
export type PublicMaster = {
  id: string;
  slug?: string | null;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  experienceYears?: number | null;
  services?: MasterServiceItem[] | null;

  avatarUrl?: string | null;
  avatarFile?: PublicFileRef;

  user?: PublicUserRef;
  city?: WithSlugAndName;
  category?: WithSlugAndName;

  rating?: number | null;
  avgRating?: number | null;
  totalReviews?: number | null;
  leadsCount?: number | null;
  responseRate?: number | null;

  isOnline?: boolean | null;
  lastActivityAt?: string | null;

  availabilityStatus?: string | null;
  currentActiveLeads?: number | null;
  maxActiveLeads?: number | null;

  // plans/tariffs (used by MasterCard and listing/search responses)
  tariffType?: 'BASIC' | 'VIP' | 'PREMIUM' | null;
  effectiveTariffType?: 'BASIC' | 'VIP' | 'PREMIUM' | null;
  tariffExpiresAt?: string | null;
  planExpiresAt?: string | null;
  tariff?: unknown;

  // promotions (used by MasterCard)
  promotions?: Array<{ discount?: number | null }> | null;
  activePromotion?: { discount?: number | null } | null;

  /** Скор популярности (только выдача /masters/popular) */
  popularityScore?: number | null;
  /** Бейдж «Топ» — для выдачи /masters/popular true у всей подборки */
  topMaster?: boolean | null;

  // misc
  isVerified?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  vip?: boolean | null;
  createdAt?: string | null;
};

export type ApiEnvelope<T> =
  | T
  | {
      data?: T;
    };

export type MastersSearchMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  nextCursor?: number | null;
};

export type MastersSearchResponse = {
  items: PublicMaster[];
  meta: MastersSearchMeta;
};

export type MastersFilterItem = {
  id: string;
  slug: string;
  name: string;
  value: string;
  count: number;
  icon?: string | null;
};

export type MastersFiltersResponse = {
  categories: MastersFilterItem[];
  cities: MastersFilterItem[];
  tariffTypes: Array<{ type: string; count: number }>;
  ratingRange: { min: number; max: number; avg: number };
  experienceRange: { min: number; max: number };
  priceRange?: { min: number; max: number };
  availableNowCount?: number;
  hasPromotionCount?: number;
};

// ====================
// Authenticated master endpoints
// ====================

export type MasterPrivateProfileResponse = {
  id: string;
  userId: string;
  slug?: string | null;
  description?: string | null;
  services?: unknown;
  avatarFileId?: string | null;
  rating?: number;
  totalReviews?: number;
  experienceYears?: number;
  cityId: string;
  categoryId: string;
  tariffType?: 'BASIC' | 'VIP' | 'PREMIUM';
  tariffExpiresAt?: string | null;
  tariffCancelAtPeriodEnd?: boolean;
  pendingUpgradeTo?: 'BASIC' | 'VIP' | 'PREMIUM' | null;
  pendingUpgradeCreatedAt?: string | null;
  isFeatured?: boolean;
  views?: number;
  leadsCount?: number;
  extraPhotosCount?: number;
  lifetimePremium?: boolean;
  isOnline?: boolean;
  lastActivityAt?: string | null;
  availabilityStatus?: string;
  maxActiveLeads?: number;
  currentActiveLeads?: number;
  telegramChatId?: string | null;
  whatsappPhone?: string | null;
  workStartHour?: number;
  workEndHour?: number;
  autoresponderEnabled?: boolean;
  autoresponderMessage?: string | null;
  slotDurationMinutes?: number;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;

  user?: { firstName?: string | null; lastName?: string | null } | null;
  category?: { id: string; name: string; slug: string; icon?: string | null } | null;
  city?: { id: string; name: string; slug: string } | null;
  payments?: unknown[];
  analytics?: unknown[];
};

export type MasterTariffResponse = {
  tariffType: 'BASIC' | 'VIP' | 'PREMIUM';
  tariffExpiresAt: string | null;
  tariffCancelAtPeriodEnd: boolean;
  lifetimePremium: boolean;
  isExpired: boolean;
  pendingUpgrade: {
    to: 'BASIC' | 'VIP' | 'PREMIUM';
    createdAt: string;
    expiresAt: string;
    hoursRemaining: number;
  } | null;
  lastPayment: unknown | null;
};

export type MasterStatsResponse = {
  leadsToday: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
};

export type UpdateOnlineStatusResponse = {
  success: true;
  isOnline: boolean;
  lastActivityAt: string | null;
};

export type AvailabilityStatusResponse = {
  success: true;
  availabilityStatus: string;
  maxActiveLeads: number;
  currentActiveLeads: number;
  isOnline: boolean;
  lastActivityAt: string | null;
  canAcceptLeads: boolean;
};

export type UpdateAvailabilityStatusResponse = {
  success: true;
  id: string;
  availabilityStatus: string;
  maxActiveLeads: number;
  currentActiveLeads: number;
  lastActivityAt: string;
};

export type ScheduleSettingsResponse = {
  workStartHour: number;
  workEndHour: number;
  slotDurationMinutes: number;
};

export type UpdateScheduleSettingsResponse = {
  success: true;
  workStartHour: number;
  workEndHour: number;
  slotDurationMinutes: number;
};

