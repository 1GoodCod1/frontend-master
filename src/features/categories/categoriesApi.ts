import { api } from '@/services/api';
import type {
  ApiEnvelope,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryDto,
  CategoryMastersResponse,
  CategoryOverviewStatDto,
  CategoryWithStatsDto,
} from '@/types';
import { patchInListResponse, idMatches } from '@/services/cacheUtils';

function unwrapArray<T>(raw: unknown): T[] {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    const envelope = raw as { data?: T[] };
    return Array.isArray(envelope.data) ? envelope.data : [];
  }
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function unwrapObject<T>(raw: ApiEnvelope<T> | T): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

export const categoriesApi = api.injectEndpoints({
  endpoints: (build) => ({
    categoriesList: build.query<CategoryDto[], { isActive?: boolean } | void>({
      query: (params) => ({ url: '/categories', method: 'GET', params: params ?? {} }),
      transformResponse: (raw: unknown) => unwrapArray<CategoryDto>(raw),
      providesTags: ['Categories'],
    }),
    categoriesCreate: build.mutation<CategoryDto, CreateCategoryDto>({
      query: (body) => ({ url: '/categories', method: 'POST', data: body }),
      invalidatesTags: ['Categories'],
    }),
    categoriesById: build.query<CategoryWithStatsDto, { id: string }>({
      query: ({ id }) => ({ url: `/categories/${id}`, method: 'GET' }),
      transformResponse: (raw: ApiEnvelope<CategoryWithStatsDto> | CategoryWithStatsDto) => unwrapObject(raw),
    }),
    categoriesUpdate: build.mutation<CategoryDto, { id: string; body: UpdateCategoryDto }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: 'PUT', data: body }),
      invalidatesTags: ['Categories'],
    }),
    categoriesDelete: build.mutation<CategoryDto, { id: string }>({
      query: ({ id }) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Categories'],
    }),
    categoriesMasters: build.query<CategoryMastersResponse, { id: string; page?: number; limit?: number }>({
      query: ({ id, page, limit }) => ({
        url: `/categories/${id}/masters`,
        method: 'GET',
        params: { ...(page ? { page } : {}), ...(limit ? { limit } : {}) },
      }),
      transformResponse: (raw: ApiEnvelope<CategoryMastersResponse> | CategoryMastersResponse) => unwrapObject(raw),
    }),
    categoriesToggle: build.mutation<CategoryDto, { id: string }>({
      query: ({ id }) => ({ url: `/categories/${id}/toggle`, method: 'PUT', data: {} }),
      invalidatesTags: ['Categories'],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patcher = (args: { isActive?: boolean } | void) =>
          dispatch(
            categoriesApi.util.updateQueryData('categoriesList', args, (draft) => {
              patchInListResponse<CategoryDto>(draft, (it) => idMatches(it, id), (it) => {
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
    categoriesWithCounts: build.query<CategoryDto[], void>({
      query: () => ({ url: '/categories', method: 'GET', params: { isActive: true } }),
      transformResponse: (raw: unknown) => unwrapArray<CategoryDto>(raw),
      providesTags: ['Categories'],
    }),
    categoriesStats: build.query<CategoryOverviewStatDto[], void>({
      query: () => ({ url: '/categories/stats/overview', method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapArray<CategoryOverviewStatDto>(raw),
    }),
  }),
});

export const {
  useCategoriesListQuery,
  useCategoriesCreateMutation,
  useCategoriesByIdQuery,
  useCategoriesUpdateMutation,
  useCategoriesDeleteMutation,
  useCategoriesMastersQuery,
  useCategoriesToggleMutation,
  useCategoriesWithCountsQuery,
  useCategoriesStatsQuery,
} = categoriesApi;
