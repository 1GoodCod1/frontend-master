import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '@/services/api';
import { env } from '@/services/env';
import { persistRefreshToken } from '@/features/auth/persist';
import { saveNotifications } from '@/features/socket/persist';
import authReducer from '@/features/auth/authSlice';
import socketReducer from '@/features/socket/socketSlice';
import uiReducer from '@/features/ui/uiSlice';
import chatReducer from '@/features/chat/chatSlice';


export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    socket: socketReducer,
    ui: uiReducer,
    chat: chatReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      // Only suppress serializability warnings for RTK Query cache (Dates inside raw API responses)
      serializableCheck: {
        ignoredPaths: [api.reducerPath],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.headers'],
      },
    }).concat(api.middleware),
});

setupListeners(store.dispatch);

let prevRefresh: string | null = null;
let prevNotifSig = '';

store.subscribe(() => {
  const st = store.getState();

  const current = st.auth.tokens?.refreshToken ?? null;
  if (current !== prevRefresh) {
    if (env.useHttpOnly) {
      if (current && current.trim()) persistRefreshToken(current);
    } else {
      persistRefreshToken(current);
    }
    prevRefresh = current;
  }

  const payload = {
    unreadLeads: st.socket.unreadLeads,
    unreadReviews: st.socket.unreadReviews,
    notifications: st.socket.notifications,
  };
  const sig = `${payload.unreadLeads}|${payload.unreadReviews}|${payload.notifications.length}|${payload.notifications[0]?.id ?? ''}`;
  if (sig !== prevNotifSig) {
    saveNotifications(payload);
    prevNotifSig = sig;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
