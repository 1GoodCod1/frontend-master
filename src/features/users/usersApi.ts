import { api } from '@/services/api';
import type { UpdateUserDto } from '@/types';

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
} = usersApi;
