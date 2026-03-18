import { api } from '@/services/api';
import type { NotificationItem } from '@/features/socket/socketSlice';
import type { SocketEventType } from '@/features/socket/socketSlice';
import { extractItems } from '@/utils/data';

const CATEGORY_TO_TYPE: Record<string, SocketEventType> = {
  NEW_LEAD: 'new_lead',
  LEAD_STATUS_UPDATED: 'lead_status_updated',
  NEW_REVIEW: 'new_review',
  NEW_CHAT_MESSAGE: 'new_chat_message',
  LEAD_SENT: 'lead_sent',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected',
  ADMIN_NEW_VERIFICATION: 'admin_new_verification',
  ADMIN_NEW_REPORT: 'admin_new_report',
  ADMIN_NEW_USER: 'admin_new_user',
  ADMIN_NEW_MASTER: 'admin_new_master',
  ADMIN_SYSTEM_ALERT: 'admin_system_alert',
  ADMIN_NEW_LEAD: 'admin_new_lead',
  ADMIN_NEW_REVIEW: 'admin_new_review',
  ADMIN_NEW_PAYMENT: 'admin_new_payment',
  MASTER_RESPONDED: 'master_responded',
  MASTER_AVAILABLE: 'master_available',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REMINDER: 'booking_confirmed',
  NEW_PROMOTION: 'master_available',
  PROMOTION_STARTED: 'master_available',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update',
};

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
  const category = raw.category ?? '';
  const type = (CATEGORY_TO_TYPE[category] ?? 'system_update') as SocketEventType;
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
