import { api } from '@/services/api';
import type {
  CityDto,
  CityMastersResponse,
  CityOverviewStatDto,
  CityWithStatsDto,
  CreateCityDto,
  UpdateCityDto,
} from '@/types';
import { patchInListResponse, idMatches } from '@/services/cacheUtils';
import { unwrapObject, extractItems } from '@/utils/data';

export const citiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    citiesList: build.query<CityDto[], { isActive?: boolean } | void>({
      query: (params) => ({ url: '/cities', method: 'GET', params: params ?? {} }),
      transformResponse: (raw: unknown) => extractItems<CityDto>(raw),
      providesTags: ['Cities'],
      keepUnusedDataFor: 7200, // 2h - cities rarely change
    }),
    citiesCreate: build.mutation<CityDto, CreateCityDto>({
      query: (body) => ({ url: '/cities', method: 'POST', data: body }),
      invalidatesTags: ['Cities', 'MastersFilters'],
    }),
    citiesById: build.query<CityWithStatsDto, { id: string }>({
      query: ({ id }) => ({ url: `/cities/${id}`, method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<CityWithStatsDto>(raw),
      keepUnusedDataFor: 7200, // 2h - cities rarely change
    }),
    citiesUpdate: build.mutation<CityDto, { id: string; body: UpdateCityDto }>({
      query: ({ id, body }) => ({ url: `/cities/${id}`, method: 'PUT', data: body }),
      invalidatesTags: ['Cities', 'MastersFilters'],
    }),
    citiesDelete: build.mutation<CityDto, { id: string }>({
      query: ({ id }) => ({ url: `/cities/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Cities', 'MastersFilters'],
    }),
    citiesMasters: build.query<CityMastersResponse, { id: string }>({
      query: ({ id }) => ({ url: `/cities/${id}/masters`, method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<CityMastersResponse>(raw),
    }),
    citiesToggle: build.mutation<CityDto, { id: string }>({
      query: ({ id }) => ({ url: `/cities/${id}/toggle`, method: 'PUT', data: {} }),
      invalidatesTags: ['Cities', 'MastersFilters'],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patcher = (args: { isActive?: boolean } | void) =>
          dispatch(
            citiesApi.util.updateQueryData('citiesList', args, (draft) => {
              patchInListResponse<CityDto>(draft, (it) => idMatches(it, id), (it) => {
                it.isActive = !it.isActive;
              });
            }),
          );
        const patches = [patcher(undefined), patcher({ isActive: true }), patcher({ isActive: false })];
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),
    citiesStats: build.query<CityOverviewStatDto[], void>({
      query: () => ({ url: '/cities/stats/overview', method: 'GET' }),
      transformResponse: (raw: unknown) => extractItems<CityOverviewStatDto>(raw),
    }),
  }),
});

export const {
  useCitiesListQuery,
  useCitiesCreateMutation,
  useCitiesByIdQuery,
  useCitiesUpdateMutation,
  useCitiesDeleteMutation,
  useCitiesMastersQuery,
  useCitiesToggleMutation,
  useCitiesStatsQuery,
} = citiesApi;
