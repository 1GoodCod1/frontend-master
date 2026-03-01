import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { env } from '@/services/env';
import type { Store } from '@reduxjs/toolkit';
import {
  setChatConnected,
  addMessage,
  setTyping,
  markConversationRead,
} from '@/features/chat/chatSlice';
import { selectAccessToken } from '@/features/auth/selectors';
import { api } from '@/services/api';
import type { ChatMessage } from '@/features/chat/chatApi';
import type { RootState } from '@/app/store';

let chatSocket: Socket | null = null;

export function getChatSocket() {
  return chatSocket;
}

export function connectChatSocket(store: Store<RootState>) {
  // If socket already exists and connected, return it
  if (chatSocket?.connected) return chatSocket;

  // If socket exists but not connected - disconnect and clear listeners
  if (chatSocket) {
    chatSocket.removeAllListeners();
    chatSocket.disconnect();
    chatSocket = null;
  }

  const token = selectAccessToken(store.getState());

  if (!token) {
    console.warn('Cannot connect chat socket without token');
    return null;
  }

  const wsBase = (env.wsUrl || '').replace(/\/$/, '');
  const chatUrl = wsBase ? `${wsBase}/chat` : '/chat';

  chatSocket = io(chatUrl, {
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  chatSocket.on('connect', () => {
    store.dispatch(setChatConnected(true));
    console.log('Chat socket connected');
  });

  chatSocket.on('disconnect', () => {
    store.dispatch(setChatConnected(false));
    console.log('Chat socket disconnected');
  });

  // Handle incoming messages — invalidate so messages refetch and appear without F5
  chatSocket.on('chat:message', (message: ChatMessage & { conversationId: string }) => {
    store.dispatch(addMessage(message));
    store.dispatch(api.util.invalidateTags(['Chat', { type: 'ChatMessages', id: message.conversationId }]));

    const state = store.getState();
    if (state.chat?.activeConversationId !== message.conversationId) {
      toast('Новое сообщение в чате', { icon: '💬' });
    }
  });

  // Handle typing indicators
  chatSocket.on('chat:typing', (data: {
    conversationId: string;
    userId: string;
    userRole: 'CLIENT' | 'MASTER';
    isTyping: boolean;
  }) => {
    store.dispatch(setTyping(data));
  });

  // Handle read receipts
  chatSocket.on('chat:read', (data: {
    conversationId: string;
    readBy: string;
  }) => {
    store.dispatch(markConversationRead(data.conversationId));
    store.dispatch(api.util.invalidateTags([{ type: 'ChatMessages', id: data.conversationId }]));
  });

  return chatSocket;
}

export function disconnectChatSocket() {
  if (!chatSocket) return;
  chatSocket.removeAllListeners();
  chatSocket.disconnect();
  chatSocket = null;
}

// Join a conversation room
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

// Leave a conversation room
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

// Send a message via WebSocket
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

// Send typing indicator
export function sendTyping(conversationId: string, isTyping: boolean): void {
  if (!chatSocket?.connected) return;
  chatSocket.emit('chat:typing', { conversationId, isTyping });
}

// Mark messages as read via WebSocket
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
