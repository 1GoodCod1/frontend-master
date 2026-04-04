import { api } from '@/services/api';
import { publicCachePolicy } from '@/config/publicCache';
import type {
  UpdateMasterDto,
  UpdateNotificationSettingsDto,
  NotificationSettings,
  QuickRepliesResponse,
  ReplaceQuickRepliesRequest,
  AutoresponderSettings,
  UpdateAutoresponderRequest,
  PublicMaster,
  ApiEnvelope,
  MastersSearchResponse,
  MastersFiltersResponse,
  MasterPrivateProfileResponse,
  MasterTariffResponse,
  MasterStatsResponse,
  UpdateOnlineStatusResponse,
  AvailabilityStatusResponse,
  UpdateAvailabilityStatusResponse,
  UpdateScheduleSettingsResponse,
  ScheduleSettingsResponse,
  SuggestResponse,
} from '@/types';
import { isRecord } from '@/utils/guards';
import { unwrapObject, toNumber } from '@/utils/data';

function get(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

/**
 * API may nest payloads as { data: { data: T } } (gateway + TransformInterceptor).
 * Walk until we find an object that carries schedule fields.
 */
function unwrapSchedulePayload(raw: unknown): Record<string, unknown> | null {
  let cur: unknown = raw;
  for (let depth = 0; depth < 8; depth++) {
    if (cur == null || typeof cur !== 'object') return null;
    const r = cur as Record<string, unknown>;
    if ('workStartHour' in r) {
      return r;
    }
    const inner = r.data;
    if (inner != null && typeof inner === 'object') {
      cur = inner;
      continue;
    }
    break;
  }
  return null;
}

function toScheduleSettings(raw: unknown): ScheduleSettingsResponse {
  const o = unwrapSchedulePayload(raw);
  if (!o) {
    const fallback = unwrapObject<Record<string, unknown>>(raw);
    return {
      workStartHour: toNumber(get(fallback, 'workStartHour'), 9),
      workEndHour: toNumber(get(fallback, 'workEndHour'), 18),
      slotDurationMinutes: toNumber(get(fallback, 'slotDurationMinutes'), 60),
    };
  }
  return {
    workStartHour: toNumber(get(o, 'workStartHour'), 9),
    workEndHour: toNumber(get(o, 'workEndHour'), 18),
    slotDurationMinutes: toNumber(get(o, 'slotDurationMinutes'), 60),
  };
}

export type MastersQuery = {
  categoryId?: string;
  cityId?: string;
  search?: string;
  tariffType?: 'BASIC' | 'VIP' | 'PREMIUM';
  isFeatured?: boolean;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  availableNow?: boolean;
  hasPromotion?: boolean;
  cursor?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'createdAt' | 'price';
  sortOrder?: 'asc' | 'desc';
};

export const mastersApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchSimple: build.query<unknown, { category?: string; city?: string; rating?: number; experience?: number } | void>({
      query: (params) => ({ url: '/search/masters', method: 'GET', params: params ?? {} }),
    }),
    mastersSearch: build.query<MastersSearchResponse, MastersQuery | void>({
      query: (params) => ({ url: '/masters', method: 'GET', params: params ?? {} }),
      transformResponse: (raw: unknown, _meta, arg): MastersSearchResponse => {
        const unwrapped = unwrapObject<unknown>(raw);
        const root = isRecord(unwrapped) ? (unwrapped as Record<string, unknown>) : {};
        const itemsRaw = get(root, 'items');
        const items = Array.isArray(itemsRaw) ? (itemsRaw as PublicMaster[]) : [];
        const metaRaw = isRecord(get(root, 'meta'))
          ? (get(root, 'meta') as Record<string, unknown>)
          : {};
        const argObj = isRecord(arg) ? (arg as Record<string, unknown>) : {};
        const page = toNumber(get(metaRaw, 'page'), toNumber(get(argObj, 'page'), 1));
        const limit = toNumber(get(metaRaw, 'limit'), toNumber(get(argObj, 'limit'), 20));
        const total = toNumber(metaRaw.total, items.length);
        const totalPages = toNumber(metaRaw.totalPages, Math.ceil(total / Math.max(1, limit)));
        return { items, meta: { total, page, limit, totalPages } };
      },
      providesTags: ['Masters'],
    }),
    mastersFilters: build.query<MastersFiltersResponse, void>({
      query: () => ({ url: '/masters/filters', method: 'GET' }),
      /** Инвалидируется при правках категорий/городов в админке (см. categoriesApi / citiesApi) */
      providesTags: ['MastersFilters'],
      /** Списки категорий/городов: в dev чаще сбрасываем, в prod дольше держим в RTK */
      keepUnusedDataFor: publicCachePolicy.mastersFiltersKeepUnusedDataFor,
      transformResponse: (raw: unknown): MastersFiltersResponse => {
        const unwrapped = unwrapObject<unknown>(raw);
        const root = isRecord(unwrapped) ? (unwrapped as Record<string, unknown>) : {};
        const ratingRangeRaw = isRecord(get(root, 'ratingRange'))
          ? (get(root, 'ratingRange') as Record<string, unknown>)
          : null;
        const experienceRangeRaw = isRecord(get(root, 'experienceRange'))
          ? (get(root, 'experienceRange') as Record<string, unknown>)
          : null;
        return {
          categories: Array.isArray(get(root, 'categories'))
            ? (get(root, 'categories') as MastersFiltersResponse['categories'])
            : [],
          cities: Array.isArray(get(root, 'cities'))
            ? (get(root, 'cities') as MastersFiltersResponse['cities'])
            : [],
          tariffTypes: Array.isArray(get(root, 'tariffTypes'))
            ? (get(root, 'tariffTypes') as MastersFiltersResponse['tariffTypes'])
            : [],
          ratingRange: ratingRangeRaw
            ? {
                min: toNumber(get(ratingRangeRaw, 'min'), 0),
                max: toNumber(get(ratingRangeRaw, 'max'), 5),
                avg: toNumber(get(ratingRangeRaw, 'avg'), 0),
              }
            : { min: 0, max: 5, avg: 0 },
          experienceRange: experienceRangeRaw
            ? {
                min: toNumber(get(experienceRangeRaw, 'min'), 0),
                max: toNumber(get(experienceRangeRaw, 'max'), 50),
              }
            : { min: 0, max: 50 },
          priceRange: (() => {
            const pr = isRecord(get(root, 'priceRange'))
              ? (get(root, 'priceRange') as Record<string, unknown>)
              : null;
            if (!pr) return { min: 0, max: 5000 };
            return {
              min: Math.max(0, toNumber(get(pr, 'min'), 0)),
              max: Math.max(100, toNumber(get(pr, 'max'), 5000)),
            };
          })(),
          availableNowCount: toNumber(get(root, 'availableNowCount'), 0),
          hasPromotionCount: toNumber(get(root, 'hasPromotionCount'), 0),
        };
      },
    }),
    mastersPopular: build.query<PublicMaster[], { limit?: number } | void>({
      query: (params) => ({ url: '/masters/popular', method: 'GET', params: params ?? {} }),
      keepUnusedDataFor: publicCachePolicy.mastersPopularKeepUnusedDataFor,
      transformResponse: (raw: unknown): PublicMaster[] => {
        const unwrapped = unwrapObject<unknown>(raw);
        if (Array.isArray(unwrapped)) return unwrapped as PublicMaster[];
        const root = isRecord(unwrapped) ? (unwrapped as Record<string, unknown>) : {};
        const items =
          get(root, 'items') ?? get(root, 'data') ?? get(root, 'rows');
        return Array.isArray(items) ? (items as PublicMaster[]) : [];
      },
      providesTags: ['Masters'],
    }),
    mastersNew: build.query<PublicMaster[], { limit?: number } | void>({
      query: (params) => ({ url: '/masters/new', method: 'GET', params: params ?? {} }),
      transformResponse: (raw: unknown): PublicMaster[] => {
        const unwrapped = unwrapObject<unknown>(raw);
        if (Array.isArray(unwrapped)) return unwrapped as PublicMaster[];
        const root = isRecord(unwrapped) ? (unwrapped as Record<string, unknown>) : {};
        const items =
          get(root, 'items') ?? get(root, 'data') ?? get(root, 'rows');
        return Array.isArray(items) ? (items as PublicMaster[]) : [];
      },
      providesTags: ['Masters'],
    }),
    mastersLandingStats: build.query<
      { verifiedMastersCount: number; verifiedOnlineMastersCount: number; completedProjectsCount: number; averageRating: number; support24_7: true },
      void
    >({
      query: () => ({ url: '/masters/landing-stats', method: 'GET' }),
      transformResponse: (raw: unknown) => {
        const unwrapped = unwrapObject<unknown>(raw);
        const r = isRecord(unwrapped) ? (unwrapped as Record<string, unknown>) : {};
        return {
          verifiedMastersCount: toNumber(r.verifiedMastersCount, 0),
          verifiedOnlineMastersCount: toNumber(r.verifiedOnlineMastersCount, 0),
          completedProjectsCount: toNumber(r.completedProjectsCount, 0),
          averageRating: toNumber(r.averageRating, 4.9),
          support24_7: true as const,
        };
      },
      providesTags: ['Masters'],
    }),
    mastersById: build.query<PublicMaster | null, { id: string }>({
      query: ({ id }) => ({ url: `/masters/${id}`, method: 'GET' }),
      transformResponse: (raw: ApiEnvelope<PublicMaster | null>): PublicMaster | null => {
        const data = unwrapObject<PublicMaster | null>(raw);
        if (!data || typeof data !== 'object') return null;
        return data as PublicMaster | null;
      },
      providesTags: (_r, _e, a) => [{ type: 'Master', id: a.id }],
    }),
    mastersMyProfile: build.query<MasterPrivateProfileResponse, void>({
      query: () => ({ url: '/masters/profile/me', method: 'GET' }),
      providesTags: ['Master'],
    }),
    mastersUpdateMyProfile: build.mutation<MasterPrivateProfileResponse, UpdateMasterDto>({
      query: (body) => ({ url: '/masters/profile/me', method: 'PUT', data: body }),
      invalidatesTags: ['Master', 'Masters', 'MastersFilters'],
    }),
    mastersUpdateServices: build.mutation<
      { services?: unknown[] },
      { services: Array<{ title: string; priceType: string; price?: number; currency?: string }> }
    >({
      query: (body) => ({ url: '/masters/profile/me/services', method: 'PATCH', data: body }),
      invalidatesTags: ['Master', 'Masters', 'MastersFilters'],
    }),
    mastersMyTariff: build.query<MasterTariffResponse, void>({
      query: () => ({ url: '/masters/tariff/me', method: 'GET' }),
      providesTags: ['Master'],
    }),
    mastersMyStats: build.query<MasterStatsResponse, void>({
      query: () => ({ url: '/masters/stats/me', method: 'GET' }),
    }),
    mastersViewsHistory: build.query<
      { periodStart: string; periodEnd: string; views: number; label: string }[],
      { period: 'week' | 'month'; limit?: number }
    >({
      query: ({ period, limit = 12 }) => ({
        url: '/masters/stats/me/views-history',
        method: 'GET',
        params: { period, limit },
      }),
    }),
    mastersUpdateOnlineStatus: build.mutation<UpdateOnlineStatusResponse, { isOnline: boolean }>({
      query: (body) => ({ url: '/masters/online-status/me', method: 'PATCH', data: body }),
      invalidatesTags: ['Master'],
    }),
    mastersUpdateAvailabilityStatus: build.mutation<
      UpdateAvailabilityStatusResponse,
      { availabilityStatus: string; maxActiveLeads?: number }
    >({
      query: (body) => ({ url: '/masters/availability-status/me', method: 'PATCH', data: body }),
      invalidatesTags: ['Master'],
    }),
    mastersGetAvailabilityStatus: build.query<AvailabilityStatusResponse, void>({
      query: () => ({ url: '/masters/availability-status/me', method: 'GET' }),
      providesTags: ['Master'],
    }),

    mastersGetNotificationSettings: build.query<NotificationSettings, void>({
      query: () => ({ url: '/masters/notifications-settings/me', method: 'GET' }),
      transformResponse: (raw: unknown): NotificationSettings => unwrapObject<NotificationSettings>(raw),
      providesTags: ['Master'],
    }),

    mastersUpdateNotificationSettings: build.mutation<NotificationSettings, UpdateNotificationSettingsDto>({
      query: (body) => ({ url: '/masters/notifications-settings/me', method: 'PATCH', data: body }),
      transformResponse: (raw: unknown): NotificationSettings => unwrapObject<NotificationSettings>(raw),
      invalidatesTags: ['Master'],
    }),

    mastersCreateTelegramConnectLink: build.mutation<
      { link: string; expiresAt: string },
      void
    >({
      query: () => ({
        url: '/masters/telegram-connect-token/me',
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => unwrapObject<{ link: string; expiresAt: string }>(raw),
      invalidatesTags: ['Master'],
    }),

    mastersGetScheduleSettings: build.query<ScheduleSettingsResponse, void>({
      query: () => ({ url: '/masters/schedule-settings/me', method: 'GET' }),
      transformResponse: (raw: unknown): ScheduleSettingsResponse => toScheduleSettings(raw),
      providesTags: ['ScheduleSettings'],
    }),

    mastersUpdateScheduleSettings: build.mutation<
      UpdateScheduleSettingsResponse,
      { workStartHour?: number; workEndHour?: number; slotDurationMinutes?: number }
    >({
      query: (body) => ({ url: '/masters/schedule-settings/me', method: 'PATCH', data: body }),
      transformResponse: (raw: unknown): UpdateScheduleSettingsResponse => ({
        success: true,
        ...toScheduleSettings(raw),
      }),
      invalidatesTags: ['ScheduleSettings', 'Master'],
    }),

    mastersGetQuickReplies: build.query<QuickRepliesResponse, void>({
      query: () => ({ url: '/masters/quick-replies/me', method: 'GET' }),
      providesTags: ['Master'],
    }),

    mastersReplaceQuickReplies: build.mutation<{ success: true; items: QuickRepliesResponse['items'] }, ReplaceQuickRepliesRequest>({
      query: (body) => ({ url: '/masters/quick-replies/me', method: 'PUT', data: body }),
      invalidatesTags: ['Master'],
    }),

    mastersGetAutoresponderSettings: build.query<AutoresponderSettings, void>({
      query: () => ({ url: '/masters/autoresponder/me', method: 'GET' }),
      providesTags: ['Master'],
    }),

    mastersUpdateAutoresponderSettings: build.mutation<
      { success: true; autoresponderEnabled: boolean; autoresponderMessage: string | null },
      UpdateAutoresponderRequest
    >({
      query: (body) => ({ url: '/masters/autoresponder/me', method: 'PATCH', data: body }),
      invalidatesTags: ['Master'],
    }),

    mastersClaimFreePlan: build.mutation<unknown, { tariffType: 'VIP' | 'PREMIUM' }>({
      query: (body) => ({
        url: '/masters/tariff/claim-free',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Master', 'Me'],
    }),

    mastersSuggest: build.query<SuggestResponse, { q: string; limit?: number; cityId?: string }>({
      query: (params) => ({ url: '/masters/suggest', method: 'GET', params }),
      transformResponse: (raw: unknown): SuggestResponse => {
        const unwrapped = unwrapObject<unknown>(raw);
        const root = isRecord(unwrapped) ? (unwrapped as Record<string, unknown>) : {};
        return {
          categories: Array.isArray(root.categories) ? (root.categories as SuggestResponse['categories']) : [],
          masters: Array.isArray(root.masters) ? (root.masters as SuggestResponse['masters']) : [],
          services: Array.isArray(root.services) ? (root.services as SuggestResponse['services']) : [],
        };
      },
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useMastersSearchQuery,
  useMastersFiltersQuery,
  useMastersPopularQuery,
  useMastersNewQuery,
  useMastersLandingStatsQuery,
  useMastersByIdQuery,
  useMastersMyProfileQuery,
  useMastersUpdateMyProfileMutation,
  useMastersUpdateServicesMutation,
  useMastersMyTariffQuery,
  useMastersMyStatsQuery,
  useMastersViewsHistoryQuery,
  useMastersUpdateOnlineStatusMutation,
  useMastersUpdateAvailabilityStatusMutation,
  useMastersGetAvailabilityStatusQuery,
  useMastersGetNotificationSettingsQuery,
  useMastersUpdateNotificationSettingsMutation,
  useMastersCreateTelegramConnectLinkMutation,
  useMastersGetScheduleSettingsQuery,
  useMastersUpdateScheduleSettingsMutation,
  useMastersGetQuickRepliesQuery,
  useMastersReplaceQuickRepliesMutation,
  useMastersGetAutoresponderSettingsQuery,
  useMastersUpdateAutoresponderSettingsMutation,
  useMastersClaimFreePlanMutation,
  useMastersSuggestQuery,
  useSearchSimpleQuery,
} = mastersApi;
