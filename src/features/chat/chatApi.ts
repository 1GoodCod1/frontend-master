import { api } from '@/services/api';
import type {
  ChatFile,
  MessageFile,
  ChatMessage,
  LeadInfo,
  MasterInfo,
  ClientInfo,
  Conversation,
  ConversationDetail,
  MessagesResponse,
  SendMessageDto,
  CreateConversationDto,
} from '@/types/chat';
import { unwrapEnvelope } from '@/utils/data';

export type {
  ChatFile,
  MessageFile,
  ChatMessage,
  LeadInfo,
  MasterInfo,
  ClientInfo,
  Conversation,
  ConversationDetail,
  MessagesResponse,
  SendMessageDto,
  CreateConversationDto,
};


function unwrap<T>(response: unknown): T {
  return unwrapEnvelope(response) as T;
}

export const chatApi = api.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<Conversation[], void>({
      query: () => ({ url: '/conversations', method: 'GET' }),
      transformResponse: (response: unknown): Conversation[] => {
        const data = unwrap<Conversation[]>(response);
        return Array.isArray(data) ? data : [];
      },
      providesTags: ['Chat'],
    }),
    getUnreadCount: build.query<{ count: number }, void>({
      query: () => ({ url: '/conversations/unread-count', method: 'GET' }),
      transformResponse: (response: unknown): { count: number } => {
        const data = unwrap<{ count: number }>(response);
        return { count: data?.count ?? 0 };
      },
      providesTags: ['ChatMessages'],
    }),
    getConversationByLeadId: build.query<ConversationDetail | null, string>({
      query: (leadId) => ({ url: `/conversations/by-lead/${leadId}`, method: 'GET' }),
      transformResponse: (response: unknown): ConversationDetail | null => {
        const data = unwrap<ConversationDetail | null>(response);
        return data || null;
      },
      providesTags: (_r, _e, leadId) => [{ type: 'Chat', id: `lead-${leadId}` }],
    }),
    getConversation: build.query<ConversationDetail, string>({
      query: (id) => ({ url: `/conversations/${id}`, method: 'GET' }),
      transformResponse: (response: unknown): ConversationDetail => unwrap<ConversationDetail>(response),
      providesTags: (_r, _e, id) => [{ type: 'Chat', id }],
    }),
    getMessages: build.query<MessagesResponse, { id: string; page?: number; limit?: number }>({
      query: ({ id, page = 1, limit = 50 }) => ({
        url: `/conversations/${id}/messages`,
        method: 'GET',
        params: { page, limit },
      }),
      transformResponse: (response: unknown): MessagesResponse => {
        const data = unwrap<MessagesResponse>(response);
        return {
          messages: Array.isArray(data?.messages) ? data.messages : [],
          pagination: data?.pagination ?? { page: 1, limit: 50, total: 0, totalPages: 0 },
        };
      },
      providesTags: (_r, _e, { id }) => [{ type: 'ChatMessages', id }],
    }),
    createConversation: build.mutation<ConversationDetail, CreateConversationDto>({
      query: (body) => ({ url: '/conversations', method: 'POST', data: body }),
      transformResponse: (response: unknown): ConversationDetail => unwrap<ConversationDetail>(response),
      invalidatesTags: ['Chat'],
    }),
    sendMessage: build.mutation<ChatMessage, { conversationId: string } & SendMessageDto>({
      query: ({ conversationId, ...body }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: unknown): ChatMessage => unwrap<ChatMessage>(response),
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: 'ChatMessages', id: conversationId },
        'Chat',
      ],
    }),
    markAsRead: build.mutation<{ count: number }, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      transformResponse: (response: unknown): { count: number } => {
        const data = unwrap<{ count: number }>(response);
        return { count: data?.count ?? 0 };
      },
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          chatApi.util.updateQueryData('getConversations', undefined, (draft: Conversation[]) => {
            if (!draft) return;
            const conv = draft.find((c) => c.id === conversationId);
            if (conv) conv.unreadCount = 0;
          })
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(chatApi.util.updateQueryData('getUnreadCount', undefined, () => ({ count: data?.count ?? 0 })));
        } catch {
          patchResult.undo();
        }
      },
    }),
    closeConversation: build.mutation<ConversationDetail, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/close`,
        method: 'PATCH',
      }),
      transformResponse: (response: unknown): ConversationDetail => unwrap<ConversationDetail>(response),
      invalidatesTags: ['Chat'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConversationsQuery,
  useGetUnreadCountQuery,
  useGetConversationByLeadIdQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useCloseConversationMutation,
} = chatApi;
