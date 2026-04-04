import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { safePersistStorage } from '@/utils/safeStorage';
import { api } from '@/services/api';
import { env } from '@/services/env';
import { persistRefreshToken } from '@/features/auth/persist';
import authReducer from '@/features/auth/authSlice';
import socketReducer from '@/features/socket/socketSlice';
import uiReducer from '@/features/ui/uiSlice';
import chatReducer from '@/features/chat/chatSlice';
import {
  persistApiCacheTransform,
  API_CACHE_PERSIST_VERSION,
  migrateApiCache,
} from './persistApiCache';
import { notificationPersistMiddleware } from './notificationPersistMiddleware';

// API cache: persist only Categories/Cities (via transform)
const apiPersistConfig = {
  key: 'faber_api',
  version: API_CACHE_PERSIST_VERSION,
  storage: safePersistStorage,
  transforms: [persistApiCacheTransform],
  migrate: migrateApiCache,
};
const persistedApiReducer = persistReducer(apiPersistConfig, api.reducer);

const rootReducer = combineReducers({
  [api.reducerPath]: persistedApiReducer,
  auth: authReducer,
  socket: socketReducer,
  ui: uiReducer,
  chat: chatReducer,
});

// Root: persist only ui — auth (tokens) excluded for security (localStorage is XSS-vulnerable)
const rootPersistConfig = {
  key: 'root',
  storage: safePersistStorage,
  whitelist: ['ui'],
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      immutableCheck: {
        warnAfter: 128,
        ignoredPaths: [api.reducerPath],
      },
      serializableCheck: {
        ignoredPaths: [api.reducerPath],
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.headers'],
      },
    }).concat(api.middleware, notificationPersistMiddleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

/** Use rootReducer type — persistReducer wraps state with _persist, breaking inference */
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

let prevRefresh: string | null = null;

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
});

