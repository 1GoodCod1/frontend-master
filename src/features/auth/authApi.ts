import { api } from '@/services/api';
import { env } from '@/services/env';
import type { LoginDto, RegisterDto, RefreshTokenDto, MeResponse } from '@/types';
import { setMe, setTokens, clearAuth } from './authSlice';
import {
  persistRefreshToken,
  persistRememberMe,
  setLogoutFlag,
  markHttpOnlySessionHint,
} from './persist';
import type { RootState } from '@/app/store';
import { usersApi } from '@/features/users/usersApi';
import i18n from '@/i18n';
import { isRecord } from '@/utils/guards';
import { unwrapEnvelope } from '@/utils/data';
import { USER_ROLE } from '@/constants/roles';

function isRole(v: unknown): v is NonNullable<MeResponse['role']> {
  return (
    v === USER_ROLE.CLIENT ||
    v === USER_ROLE.MASTER ||
    v === USER_ROLE.ADMIN
  );
}

function extractTokens(resp: unknown): { accessToken?: string; refreshToken?: string } {
  const d = unwrapEnvelope(resp);
  if (!isRecord(d)) return {};

  const accessToken = d.accessToken ?? d.access_token ?? d.token;
  const refreshToken = d.refreshToken ?? d.refresh_token;
  return {
    accessToken: accessToken ? String(accessToken) : undefined,
    refreshToken: refreshToken ? String(refreshToken) : undefined,
  };
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    authRegister: build.mutation<unknown, RegisterDto>({
      query: (body) => ({ url: '/auth/register', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, arg) => {
        const tags: Array<'Me' | 'Masters' | 'MastersFilters'> = ['Me'];
        if (arg.role === 'MASTER') {
          tags.push('MastersFilters', 'Masters');
        }
        return tags;
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const t = extractTokens(data);

          if (t.accessToken) {
            const refreshToken = env.useHttpOnly ? '' : (t.refreshToken ?? '');
            dispatch(setTokens({ accessToken: t.accessToken, refreshToken }));
            if (t.refreshToken) persistRefreshToken(String(t.refreshToken));
            if (env.useHttpOnly) markHttpOnlySessionHint(true);
            await dispatch(
              authApi.endpoints.authMe.initiate(undefined, { forceRefetch: true }),
            ).unwrap();
            const lang = i18n.language;
            if (lang && ['en', 'ru', 'ro'].includes(lang)) {
              dispatch(
                usersApi.endpoints.usersSetPreferredLanguage.initiate({
                  lang: lang as 'en' | 'ru' | 'ro',
                }),
              ).catch(() => {});
            }
          }
        } catch {
          // ignore token refresh errors
        }
      },
    }),

    authRegistrationOptions: build.query<unknown, void>({
      query: () => ({ url: '/auth/registration-options', method: 'GET' }),
    }),

    authEarlyBirdStatus: build.query<{ isActive: boolean; remainingSlots: number; totalSlots: number }, void>({
      query: () => ({ url: '/auth/early-bird-status', method: 'GET' }),
      transformResponse: (response: unknown) => {
        const raw = unwrapEnvelope(response);
        if (
          isRecord(raw) &&
          typeof raw.isActive === 'boolean' &&
          typeof raw.remainingSlots === 'number' &&
          typeof raw.totalSlots === 'number'
        ) {
          return {
            isActive: raw.isActive,
            remainingSlots: raw.remainingSlots,
            totalSlots: raw.totalSlots,
          };
        }
        return { isActive: false, remainingSlots: 0, totalSlots: 0 };
      },
    }),

    authLogin: build.mutation<unknown, LoginDto>({
      query: (body) => ({ url: '/auth/login', method: 'POST', data: body }),
      invalidatesTags: ['Me'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const t = extractTokens(data);
          const rememberMe = !!arg.rememberMe;

          if (t.accessToken) {
            persistRememberMe(rememberMe);
            const refreshToken = env.useHttpOnly ? '' : (t.refreshToken ?? '');
            dispatch(setTokens({ accessToken: t.accessToken, refreshToken }));
            if (t.refreshToken) persistRefreshToken(String(t.refreshToken), rememberMe);
            if (env.useHttpOnly) markHttpOnlySessionHint(true);
            try {
              await dispatch(
                authApi.endpoints.authMe.initiate(undefined, { forceRefetch: true }),
              );
            } catch (meError) {
              console.error('Failed to fetch user profile after login:', meError);
            }
          }
        } catch (error) {
          console.error('Login error:', error);
        }
      },
    }),

    authRefresh: build.mutation<unknown, RefreshTokenDto | void>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', data: body ?? {} }),
      invalidatesTags: ['Me'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const t = extractTokens(data);

          if (t.accessToken) {
            const state = getState() as RootState;
            const prevRefresh = state.auth.tokens?.refreshToken ?? '';
            const refreshToken = env.useHttpOnly ? '' : (t.refreshToken ?? prevRefresh);
            dispatch(setTokens({ accessToken: t.accessToken, refreshToken }));
            if (t.refreshToken) persistRefreshToken(String(t.refreshToken));
            if (env.useHttpOnly) markHttpOnlySessionHint(true);

            try {
              await dispatch(
                authApi.endpoints.authMe.initiate(undefined, { forceRefetch: true }),
              ).unwrap();
            } catch (meError: unknown) {
              const err = isRecord(meError) ? meError : {};
              const errStatus =
                (typeof err.status === 'number' ? err.status : undefined) ??
                (typeof err.originalStatus === 'number' ? err.originalStatus : undefined);
              if (errStatus === 401 || errStatus === 403) {
                dispatch(clearAuth());
                persistRefreshToken(null);
                if (env.useHttpOnly) markHttpOnlySessionHint(false);
              }
            }
          } else {
            dispatch(clearAuth());
            persistRefreshToken(null);
            if (env.useHttpOnly) markHttpOnlySessionHint(false);
          }
        } catch {
          dispatch(clearAuth());
          persistRefreshToken(null);
          if (env.useHttpOnly) markHttpOnlySessionHint(false);
        }
      },
    }),

    authLogout: build.mutation<unknown, RefreshTokenDto | void>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', data: body ?? {} }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(api.util.resetApiState());
        dispatch(clearAuth());
        persistRefreshToken(null);
        persistRememberMe(false);
        if (env.useHttpOnly) markHttpOnlySessionHint(false);
        setLogoutFlag();
        try {
          await queryFulfilled;
        } catch {
          // logout proceeds regardless
        }
      },
    }),

    authMe: build.query<MeResponse, void>({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Me'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const raw = unwrapEnvelope(data);
          const me =
            isRecord(raw) && 'user' in raw && isRecord(raw.user) ? raw.user : raw;
          
          if (isRecord(me) && isRole(me.role)) {
            dispatch(setMe(me as MeResponse));
          } else {
            console.warn('authMe: No role in response', me);
          }
        } catch (error) {
          const state = getState() as RootState;
          const isAuthed = Boolean(state.auth.tokens?.accessToken);
          
          if (!isAuthed) {
            return;
          }
          
          const err = isRecord(error) ? error : {};
          if (err.status === 401 || err.status === 403) {
            dispatch(setMe(null));
          }
        }
      },
    }),

    forgotPassword: build.mutation<unknown, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', data: body }),
    }),

    resetPassword: build.mutation<unknown, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', data: body }),
    }),
  }),
});

export const {
  useAuthRegisterMutation,
  useAuthRegistrationOptionsQuery,
  useAuthEarlyBirdStatusQuery,
  useAuthLoginMutation,
  useAuthRefreshMutation,
  useAuthLogoutMutation,
  useAuthMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
