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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapObject<T>(raw: unknown): T {
  if (isRecord(raw) && 'data' in raw) {
    const d = (raw as { data?: T }).data;
    if (d !== undefined) return d;
  }
  return raw as T;
}

function unwrapArray<T>(raw: unknown): T[] {
  const inner = unwrapObject<unknown>(raw);
  if (Array.isArray(inner)) return inner as T[];
  return [];
}

export const citiesApi = api.injectEndpoints({
  endpoints: (build) => ({
    citiesList: build.query<CityDto[], { isActive?: boolean } | void>({
      query: (params) => ({ url: '/cities', method: 'GET', params: params ?? {} }),
      transformResponse: (raw: unknown) => unwrapArray<CityDto>(raw),
      providesTags: ['Cities'],
    }),
    citiesCreate: build.mutation<CityDto, CreateCityDto>({
      query: (body) => ({ url: '/cities', method: 'POST', data: body }),
      invalidatesTags: ['Cities'],
    }),
    citiesById: build.query<CityWithStatsDto, { id: string }>({
      query: ({ id }) => ({ url: `/cities/${id}`, method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<CityWithStatsDto>(raw),
    }),
    citiesUpdate: build.mutation<CityDto, { id: string; body: UpdateCityDto }>({
      query: ({ id, body }) => ({ url: `/cities/${id}`, method: 'PUT', data: body }),
      invalidatesTags: ['Cities'],
    }),
    citiesDelete: build.mutation<CityDto, { id: string }>({
      query: ({ id }) => ({ url: `/cities/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Cities'],
    }),
    citiesMasters: build.query<CityMastersResponse, { id: string }>({
      query: ({ id }) => ({ url: `/cities/${id}/masters`, method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<CityMastersResponse>(raw),
    }),
    citiesToggle: build.mutation<CityDto, { id: string }>({
      query: ({ id }) => ({ url: `/cities/${id}/toggle`, method: 'PUT', data: {} }),
      invalidatesTags: ['Cities'],
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
      transformResponse: (raw: unknown) => unwrapArray<CityOverviewStatDto>(raw),
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
