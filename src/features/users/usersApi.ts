import { api } from '@/services/api';
import { clearAuth } from '@/features/auth/authSlice';
import { persistRefreshToken, setLogoutFlag } from '@/features/auth/persist';
import type { UpdateUserDto } from '@/types';

export interface PersonalDataExport {
  exportDate: string;
  user: {
    id: string;
    email: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    isVerified: boolean;
    preferredLanguage: string | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
  };
  masterProfile: unknown | null;
  leads: unknown[];
  reviews: unknown[];
  bookings: unknown[];
  loginHistory: unknown[];
  favorites: unknown[];
  notifications: unknown[];
}

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    usersById: build.query<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/users/${id}`, method: 'GET' }),
    }),
    usersUpdate: build.mutation<unknown, { id: string; body: UpdateUserDto }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PUT', data: body }),
      invalidatesTags: ['Users'],
    }),
    usersDelete: build.mutation<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),
    usersToggleBan: build.mutation<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/users/${id}/ban`, method: 'PUT' }),
      invalidatesTags: ['Users', 'Admin'],
    }),
    usersToggleVerify: build.mutation<unknown, { id: string }>({
      query: ({ id }) => ({ url: `/users/${id}/verify`, method: 'PUT' }),
      invalidatesTags: ['Users', 'Admin'],
    }),
    usersStats: build.query<unknown, void>({
      query: () => ({ url: '/users/stats/overview', method: 'GET' }),
    }),
    usersSetAvatar: build.mutation<unknown, { fileId?: string }>({
      query: ({ fileId }) => ({ url: '/users/me/avatar', method: 'PUT', data: { fileId: fileId || '' } }),
      invalidatesTags: ['Me', 'Users', 'Files'],
    }),
    usersSetPreferredLanguage: build.mutation<
      { preferredLanguage: string },
      { lang: 'en' | 'ru' | 'ro' }
    >({
      query: ({ lang }) => ({
        url: '/users/me/preferred-language',
        method: 'PATCH',
        data: { lang },
      }),
      invalidatesTags: ['Me'],
    }),

    usersDeleteSelf: build.mutation<{ ok: true }, void>({
      query: () => ({ url: '/users/me', method: 'DELETE' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(api.util.resetApiState());
          dispatch(clearAuth());
          persistRefreshToken(null);
          setLogoutFlag();
        } catch {
          // deletion failed — keep state
        }
      },
    }),

    usersExportPersonalData: build.query<PersonalDataExport, void>({
      query: () => ({ url: '/users/me/export', method: 'GET' }),
    }),
  }),
});

export const {
  useUsersByIdQuery,
  useUsersUpdateMutation,
  useUsersDeleteMutation,
  useUsersToggleBanMutation,
  useUsersToggleVerifyMutation,
  useUsersStatsQuery,
  useUsersSetAvatarMutation,
  useUsersSetPreferredLanguageMutation,
  useUsersDeleteSelfMutation,
  useLazyUsersExportPersonalDataQuery,
} = usersApi;
