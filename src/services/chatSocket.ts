import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { env } from '@/services/env';
import {
  setChatConnected,
  addMessage,
  setTyping,
  markConversationRead,
} from '@/features/chat/chatSlice';
import { selectAccessToken } from '@/features/auth/selectors';
import { chatApi } from '@/features/chat/chatApi';
import type { ChatMessage, MessagesResponse, Conversation } from '@/features/chat/chatApi';
import type { RootState, AppDispatch } from '@/app/store';

let chatSocket: Socket | null = null;

export function getChatSocket() {
  return chatSocket;
}

export function connectChatSocket(store: { dispatch: AppDispatch; getState: () => RootState }) {
  if (chatSocket?.connected) return chatSocket;
  if (chatSocket) return chatSocket;

  const token = selectAccessToken(store.getState());

  if (!token) {
    console.warn('Cannot connect chat socket without token');
    return null;
  }

  const wsBase = (env.wsUrl || '').replace(/\/$/, '');
  const chatUrl = wsBase ? `${wsBase}/chat` : '/chat';

  chatSocket = io(chatUrl, {
    transports: ['websocket', 'polling'],
    auth: (cb) => {
      const t = selectAccessToken(store.getState());
      cb(t ? { token: t } : {});
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  chatSocket.on('connect', () => {
    store.dispatch(setChatConnected(true));
  });

  chatSocket.on('disconnect', () => {
    store.dispatch(setChatConnected(false));
  });

  // Handle incoming messages - Update cache directly without full refetch
  chatSocket.on('chat:message', (message: ChatMessage & { conversationId: string }) => {
    const state = store.getState();
    const isViewing = state.chat?.activeConversationId === message.conversationId;

    store.dispatch(addMessage(message));
    store.dispatch(
      chatApi.util.updateQueryData('getMessages', { id: message.conversationId }, (draft: MessagesResponse) => {
        if (draft?.messages) {
          const existing = draft.messages.find(m => m.id === message.id);
          if (!existing) {
            const msgWithRead = isViewing ? { ...message, readAt: new Date().toISOString() } : message;
            draft.messages.unshift(msgWithRead);
          }
        }
      })
    );

    store.dispatch(
      chatApi.util.updateQueryData('getConversations', undefined, (draft: Conversation[]) => {
        if (!draft) return;
        const convIndex = draft.findIndex(c => c.id === message.conversationId);
        if (convIndex !== -1) {
          const conv = draft[convIndex];
          conv.lastMessage = message;
          if (isViewing) conv.unreadCount = 0;
          else conv.unreadCount = (conv.unreadCount || 0) + 1;
          draft.splice(convIndex, 1);
          draft.unshift(conv);
        }
      })
    );

    if (isViewing) {
      store.dispatch(markConversationRead(message.conversationId));
      markAsReadWs(message.conversationId);
      store.dispatch(chatApi.util.invalidateTags(['ChatMessages']));
    } else {
      toast('Новое сообщение в чате', { icon: '💬' });
    }
  });

  chatSocket.on('chat:typing', (data: {
    conversationId: string;
    userId: string;
    userRole: 'CLIENT' | 'MASTER';
    isTyping: boolean;
  }) => {
    store.dispatch(setTyping(data));
  });
  chatSocket.on('chat:read', (data: {
    conversationId: string;
    readBy: string;
  }) => {
    store.dispatch(markConversationRead(data.conversationId));
    store.dispatch(
      chatApi.util.updateQueryData('getMessages', { id: data.conversationId }, (draft: MessagesResponse) => {
        if (draft?.messages) {
          draft.messages.forEach(m => {
            if (!m.readAt && m.senderId !== data.readBy) {
              m.readAt = new Date().toISOString();
            }
          });
        }
      })
    );
    store.dispatch(
      chatApi.util.updateQueryData('getConversations', undefined, (draft: Conversation[]) => {
        if (!draft) return;
        const conv = draft.find(c => c.id === data.conversationId);
        if (conv) conv.unreadCount = 0;
      })
    );
    store.dispatch(chatApi.util.invalidateTags(['ChatMessages']));
  });

  return chatSocket;
}

export function disconnectChatSocket() {
  if (!chatSocket) return;
  chatSocket.removeAllListeners();
  chatSocket.disconnect();
  chatSocket = null;
}

export function joinConversation(conversationId: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!chatSocket?.connected) {
      resolve({ success: false, error: 'Not connected' });
      return;
    }
    chatSocket.emit('chat:join', { conversationId }, (response: { success: boolean; error?: string }) => {
      resolve(response);
    });
  });
}

export function leaveConversation(conversationId: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    if (!chatSocket?.connected) {
      resolve({ success: false });
      return;
    }
    chatSocket.emit('chat:leave', { conversationId }, (response: { success: boolean }) => {
      resolve(response);
    });
  });
}

export function sendMessageWs(
  conversationId: string,
  content: string,
  fileIds?: string[],
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  return new Promise((resolve) => {
    if (!chatSocket?.connected) {
      resolve({ success: false, error: 'Not connected' });
      return;
    }
    chatSocket.emit(
      'chat:message',
      { conversationId, content, fileIds },
      (response: { success: boolean; message?: ChatMessage; error?: string }) => {
        resolve(response);
      },
    );
  });
}

export function sendTyping(conversationId: string, isTyping: boolean): void {
  if (!chatSocket?.connected) return;
  chatSocket.emit('chat:typing', { conversationId, isTyping });
}

export function markAsReadWs(conversationId: string): Promise<{ success: boolean; count?: number }> {
  return new Promise((resolve) => {
    if (!chatSocket?.connected) {
      resolve({ success: false });
      return;
    }
    chatSocket.emit('chat:read', { conversationId }, (response: { success: boolean; count?: number }) => {
      resolve(response);
    });
  });
}
