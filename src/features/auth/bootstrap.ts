import { env } from '@/services/env';
import {
  loadPersistedRefreshToken,
  persistRefreshToken,
  takeLogoutFlag,
  isHttpOnlyGuestHint,
  markHttpOnlySessionHint,
} from './persist';
import { setTokens, clearAuth, setRestoring } from './authSlice';
import { authApi } from './authApi';
import type { AppDispatch, RootState } from '@/app/store';
import { isRecord } from '@/utils/guards';

export async function bootstrapAuth(store: { dispatch: AppDispatch; getState: () => RootState }) {
  const useHttpOnly = env.useHttpOnly;
  const rt = loadPersistedRefreshToken();
  const justLoggedOut = takeLogoutFlag();

  // После явного разлогина не дергаем /auth/refresh при следующем F5 (нет 401 в консоли)
  if (justLoggedOut && !rt) {
    store.dispatch(setRestoring(false));
    return;
  }

  if (useHttpOnly && isHttpOnlyGuestHint()) {
    store.dispatch(setRestoring(false));
    return;
  }

  // Без refresh-токена и без httpOnly не дергаем /auth/refresh
  if (!useHttpOnly && !rt) {
    store.dispatch(setRestoring(false));
    return;
  }

  store.dispatch(setRestoring(true));
  if (rt) {
    store.dispatch(setTokens({ accessToken: '', refreshToken: rt }));
  }

  try {
    const result = await store.dispatch(
      authApi.endpoints.authRefresh.initiate(
        useHttpOnly ? undefined : { refreshToken: rt ?? '' },
      ),
    );

    const r = result as unknown;
    if (isRecord(r) && r.error) {
      const err = isRecord(r.error) ? r.error : {};
      const errorStatus = typeof err.status === 'number' ? err.status : undefined;
      if (errorStatus === 401 || errorStatus === 403) {
        store.dispatch(clearAuth());
        persistRefreshToken(null);
        if (useHttpOnly) markHttpOnlySessionHint(false);
      } else {
        console.warn('Bootstrap auth: Temporary error', err);
      }
    } else if (useHttpOnly) {
      persistRefreshToken(null);
      markHttpOnlySessionHint(true);
    }
  } catch (e: unknown) {
    const err = isRecord(e) ? e : {};
    const status =
      (typeof err.status === 'number' ? err.status : undefined) ??
      (isRecord(err.response) && typeof err.response.status === 'number'
        ? err.response.status
        : undefined);
    if (status === 401) {
      store.dispatch(clearAuth());
      persistRefreshToken(null);
      if (useHttpOnly) markHttpOnlySessionHint(false);
    }
  } finally {
    store.dispatch(setRestoring(false));
  }
}