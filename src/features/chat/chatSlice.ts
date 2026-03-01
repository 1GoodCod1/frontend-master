import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from './chatApi';
import { TYPING_TIMEOUT_MS } from './constants';

export interface TypingUser {
  conversationId: string;
  userId: string;
  userRole: 'CLIENT' | 'MASTER';
  timestamp: number;
}

interface ChatState {
  connected: boolean;
  activeConversationId: string | null;
  unreadCounts: Record<string, number>;
  typingUsers: TypingUser[];
  recentMessages: ChatMessage[];
} 

const initialState: ChatState = {
  connected: false,
  activeConversationId: null,
  unreadCounts: {},
  typingUsers: [],
  recentMessages: [],
};

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },

    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },

    addMessage(state, action: PayloadAction<ChatMessage>) {
      const message = action.payload;
      state.recentMessages.unshift(message);
      if (state.recentMessages.length > 100) {
        state.recentMessages.length = 100;
      }
      if (message.conversationId !== state.activeConversationId) {
        state.unreadCounts[message.conversationId] =
          (state.unreadCounts[message.conversationId] || 0) + 1;
      }
    },

    setTyping(
      state,
      action: PayloadAction<{
        conversationId: string;
        userId: string;
        userRole: 'CLIENT' | 'MASTER';
        isTyping: boolean;
      }>,
    ) {
      const { conversationId, userId, userRole, isTyping } = action.payload;
      const now = Date.now();

      state.typingUsers = state.typingUsers.filter(
        (t) => now - t.timestamp < TYPING_TIMEOUT_MS,
      );

      state.typingUsers = state.typingUsers.filter(
        (t) => !(t.conversationId === conversationId && t.userId === userId),
      );

      if (isTyping) {
        state.typingUsers.push({
          conversationId,
          userId,
          userRole,
          timestamp: now,
        });
      }
    },

    markConversationRead(state, action: PayloadAction<string>) {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = 0;
    },

    setUnreadCount(
      state,
      action: PayloadAction<{ conversationId: string; count: number }>,
    ) {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
    },

    clearTyping(state, action: PayloadAction<string>) {
      const conversationId = action.payload;
      state.typingUsers = state.typingUsers.filter(
        (t) => t.conversationId !== conversationId,
      );
    },

    resetChatState(state) {
      state.connected = false;
      state.activeConversationId = null;
      state.unreadCounts = {};
      state.typingUsers = [];
      state.recentMessages = [];
    },
  },
});

export const {
  setChatConnected,
  setActiveConversation,
  addMessage,
  setTyping,
  markConversationRead,
  setUnreadCount,
  clearTyping,
  resetChatState,
} = slice.actions;

export default slice.reducer;

export const selectChatConnected = (state: { chat: ChatState }) =>
  state.chat.connected;

export const selectActiveConversationId = (state: { chat: ChatState }) =>
  state.chat.activeConversationId;

export const selectUnreadCount = (conversationId: string) => (state: { chat: ChatState }) =>
  state.chat.unreadCounts[conversationId] || 0;

export const selectTotalUnreadCount = (state: { chat: ChatState }) =>
  Object.values(state.chat.unreadCounts).reduce((sum, count) => sum + count, 0);

export const selectTypingUsers = (conversationId: string) => (state: { chat: ChatState }) =>
  state.chat.typingUsers.filter((t) => t.conversationId === conversationId);

export const selectRecentMessages = (state: { chat: ChatState }) =>
  state.chat.recentMessages;
