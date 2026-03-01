import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { env } from '@/services/env';
import type { RootState } from '@/app/store';
import { clearAuth, setTokens } from '@/features/auth/authSlice';
import { persistRefreshToken, setLogoutFlag } from '@/features/auth/persist';
import { getSessionId } from '@/utils/sessionId';

const isNetworkOr5xx = (status: number | undefined) =>
  status == null || status === 0 || (status >= 500 && status < 600);

type ApiErrorLike = { status?: number; data?: unknown };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapEnvelope(raw: unknown): unknown {
  if (isRecord(raw) && 'data' in raw) {
    const d = (raw as { data?: unknown }).data;
    return d !== undefined ? d : raw;
  }
  return raw;
}

type RefreshTokens = { accessToken: string; refreshToken?: string };

function parseRefreshTokens(raw: unknown): RefreshTokens | null {
  const unwrapped = unwrapEnvelope(raw);
  if (!isRecord(unwrapped)) return null;
  const accessToken = unwrapped.accessToken;
  if (typeof accessToken !== 'string' || !accessToken) return null;
  const refreshToken = unwrapped.refreshToken;
  return {
    accessToken,
    refreshToken: typeof refreshToken === 'string' && refreshToken ? refreshToken : undefined,
  };
}

const toErrorMessage = (error: ApiErrorLike): string => {
  const d = error?.data;
  if (isRecord(d) && typeof d.message === 'string') return d.message;
  if (typeof d === 'string') return d;
  if (error?.status === 502) return 'Сервер временно недоступен. Попробуйте позже.';
  if (error?.status === 503) return 'Сервис перегружен. Попробуйте позже.';
  if (error?.status && error.status >= 500) return 'Ошибка сервера. Попробуйте позже.';
  return 'Нет соединения с интернетом. Проверьте сеть и повторите.';
};

export type AxiosBaseQueryArgs = {
  url: string;
  method: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
};

type AxiosBaseQueryError = {
  status?: number;
  data?: unknown;
};

const axiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
  withCredentials: env.useHttpOnly,
});

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
    async (args, api) => {
      try {
        const state = api.getState() as RootState;
        const accessToken = state.auth.tokens?.accessToken;

        const isFormData = args.data instanceof FormData;

        // Собираем заголовки
        const headers: Record<string, string> = {};

        // Копируем существующие заголовки
        if (args.headers && isRecord(args.headers)) {
          for (const [k, v] of Object.entries(args.headers)) {
            if (typeof v === 'string') headers[k] = v;
          }
        }

        // Добавляем Authorization токен
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        // Session ID для рекомендаций и «Недавно просмотренные» (анонимы и дублирование для юзеров)
        const sessionId = getSessionId();
        if (sessionId) {
          headers['x-session-id'] = sessionId;
        }

        // Удаляем Content-Type для FormData, чтобы браузер установил правильный boundary
        if (isFormData) {
          delete headers['Content-Type'];
          delete headers['content-type'];
        }

        const res = await axiosInstance.request({
          url: args.url,
          method: args.method,
          data: args.data,
          params: args.params,
          headers,
        });

        return { data: res.data };
      } catch (e) {
        const err = e as AxiosError;
        return {
          error: {
            status: err.response?.status,
            data: err.response?.data ?? err.message,
          },
        };
      }
    };

// Wrapper that refreshes token once on 401, then retries original request
export const baseQueryWithReauth =
  (baseQuery: ReturnType<typeof axiosBaseQuery>): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
    async (args, api, extraOptions) => {
      let result = await baseQuery(args, api, extraOptions);

      if (result.error?.status === 401) {
        const url = args.url ?? '';
        const isRefresh = url.endsWith('/auth/refresh') || url === '/auth/refresh';
        const isLogout = url.endsWith('/auth/logout') || url === '/auth/logout';
        if (isRefresh || isLogout) {
          api.dispatch(clearAuth());
          persistRefreshToken(null);
          setLogoutFlag();
          return result;
        }

        const state = api.getState() as RootState;
        const refreshToken = state.auth.tokens?.refreshToken;
        const useHttpOnly = env.useHttpOnly;

        if (!useHttpOnly && !refreshToken) {
          api.dispatch(clearAuth());
          persistRefreshToken(null);
          setLogoutFlag();
          return result;
        }

        // httpOnly: refresh via cookie (no body); else: POST /auth/refresh { refreshToken }
        const refreshPayload = useHttpOnly ? {} : { refreshToken: refreshToken! };
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST', data: refreshPayload },
          api,
          extraOptions
        );

        if (refreshResult.error) {
          api.dispatch(clearAuth());
          persistRefreshToken(null);
          setLogoutFlag();
          return result;
        }

        if (refreshResult.data !== undefined) {
          const tokensFromApi = parseRefreshTokens(refreshResult.data);
          const accessToken = tokensFromApi?.accessToken ?? null;
          const newRefreshToken = tokensFromApi?.refreshToken ?? '';

          if (accessToken && typeof accessToken === 'string') {
            const tokens = {
              accessToken,
              refreshToken: useHttpOnly ? newRefreshToken : (newRefreshToken || refreshToken || ''),
            };
            api.dispatch(setTokens(tokens));
            if (newRefreshToken) persistRefreshToken(newRefreshToken);
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(clearAuth());
            persistRefreshToken(null);
            setLogoutFlag();
          }
        } else {
          api.dispatch(clearAuth());
          persistRefreshToken(null);
          setLogoutFlag();
        }
      }

      // Единая обработка 5xx и сетевых ошибок: тост с опцией повтора через refetch на экране
      if (result.error && isNetworkOr5xx(result.error.status)) {
        toast.error(toErrorMessage(result.error), { duration: 6000, id: 'api-error-toast' });
      }

      return result;
    };

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth(axiosBaseQuery()),
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  tagTypes: [
    'Me',
    'Masters',
    'Master',
    'Leads',
    'Reviews',
    'Payments',
    'Categories',
    'Cities',
    'Users',
    'Audit',
    'Admin',
    'Files',
    'Analytics',
    'Bookings',
    'Reports',
    'Favorites',
    'Recommendations',
    'Promotions',
    'Tariffs',
    'Verification',
    'VerificationStats',
    'Ideas',
    'Chat',
    'ChatMessages',
    'Portfolio',
  ],
  endpoints: () => ({}),
});
