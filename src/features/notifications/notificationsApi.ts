import { api } from '@/services/api';
import type { NotificationItem } from '@/features/socket/socketSlice';
import type { SocketEventType } from '@/features/socket/socketSlice';
import { NOTIFICATION_CATEGORY_TO_EVENT_TYPE } from '@/constants/notificationCategoryToEventType';
import { NOTIFICATION_EVENT_TYPE } from '@/constants/notificationEventType';
import { extractItems } from '@/utils/data';

type ApiNotification = {
  id: string;
  category?: string | null;
  title?: string | null;
  message: string;
  readAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

function mapApiToItem(raw: ApiNotification): NotificationItem {
  const category = String(raw.category ?? '').toUpperCase();
  const type = (NOTIFICATION_CATEGORY_TO_EVENT_TYPE[category] ??
    NOTIFICATION_EVENT_TYPE.system_update) as SocketEventType;
  const meta = (raw.metadata ?? {}) as Record<string, unknown>;
  const payload: Record<string, unknown> = {
    ...meta,
    conversationId: meta.conversationId,
    masterId: meta.masterId,
    data: meta.masterId ? { masterId: meta.masterId } : meta.data,
  };
  return {
    id: raw.id,
    type,
    title: raw.title ?? 'Уведомление',
    message: raw.message,
    createdAt: new Date(raw.createdAt).getTime(),
    read: raw.readAt != null,
    pinned: false,
    payload,
  };
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<NotificationItem[], { limit?: number } | void>({
      query: (params) => ({
        url: '/notifications',
        method: 'GET',
        params: { limit: params?.limit ?? 50 },
      }),
      providesTags: ['Notifications'],
      transformResponse: (raw: unknown) => {
        const items = extractItems<ApiNotification>(raw);
        return items.map(mapApiToItem);
      },
    }),

    markNotificationAsRead: build.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsAsRead: build.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    deleteAllNotifications: build.mutation<void, void>({
      query: () => ({
        url: '/notifications',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteAllNotificationsMutation,
} = notificationsApi;
