import { api } from '@/services/api';
import type {
  FavoriteDto,
  FavoritesCheckResponse,
  FavoritesCountResponse,
  FavoritesRemoveResponse,
} from '@/types';
import { unwrapObject, extractItems } from '@/utils/data';

export const favoritesApi = api.injectEndpoints({
  endpoints: (build) => ({
    favorites: build.query<FavoriteDto[], void>({
      query: () => ({ url: '/favorites', method: 'GET' }),
      transformResponse: (raw: unknown) => extractItems<FavoriteDto>(raw),
      providesTags: ['Favorites'],
    }),

    favoritesAdd: build.mutation<FavoriteDto, { masterId: string }>({
      query: ({ masterId }) => ({ url: `/favorites/${masterId}`, method: 'POST' }),
      invalidatesTags: (_result, _error, { masterId }) => [
        'Favorites',
        { type: 'Favorites', id: masterId },
      ],
    }),

    favoritesRemove: build.mutation<FavoritesRemoveResponse, { masterId: string }>({
      query: ({ masterId }) => ({ url: `/favorites/${masterId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { masterId }) => [
        'Favorites',
        { type: 'Favorites', id: masterId },
      ],
    }),

    favoritesCheck: build.query<FavoritesCheckResponse, { masterId: string }>({
      query: ({ masterId }) => ({ url: `/favorites/check/${masterId}`, method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<FavoritesCheckResponse>(raw),
      providesTags: (_r, _e, a) => [{ type: 'Favorites', id: a.masterId }],
    }),

    favoritesCount: build.query<FavoritesCountResponse, void>({
      query: () => ({ url: '/favorites/count', method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<FavoritesCountResponse>(raw),
      providesTags: ['Favorites'],
    }),
  }),
});

export const {
  useFavoritesQuery,
  useFavoritesAddMutation,
  useFavoritesRemoveMutation,
  useFavoritesCheckQuery,
  useFavoritesCountQuery,
} = favoritesApi;
