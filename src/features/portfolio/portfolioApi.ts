import { api } from '@/services/api';
import type {
    CreatePortfolioItemRequest,
    DeletePortfolioItemResponse,
    PortfolioItemDto,
    ReorderPortfolioRequest,
    UpdatePortfolioItemRequest,
} from '@/types';

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
}

function unwrapArray<T>(raw: unknown): T[] {
    if (isRecord(raw) && 'data' in raw) {
        const d = (raw as { data?: unknown }).data;
        if (Array.isArray(d)) return d as T[];
    }
    if (Array.isArray(raw)) return raw as T[];
    return [];
}

export const portfolioApi = api.injectEndpoints({
    endpoints: (build) => ({
        portfolioByMaster: build.query<PortfolioItemDto[], { masterId: string; serviceTag?: string }>({
            query: ({ masterId, serviceTag }) => ({
                url: `/portfolio/master/${masterId}`,
                method: 'GET',
                params: serviceTag ? { serviceTag } : {},
            }),
            transformResponse: (raw: unknown) => unwrapArray<PortfolioItemDto>(raw),
            providesTags: ['Portfolio'],
        }),

        portfolioTags: build.query<string[], { masterId: string }>({
            query: ({ masterId }) => ({
                url: `/portfolio/master/${masterId}/tags`,
                method: 'GET',
            }),
            transformResponse: (raw: unknown) => unwrapArray<string>(raw),
        }),

        portfolioCreate: build.mutation<PortfolioItemDto, CreatePortfolioItemRequest>({
            query: (body) => ({
                url: '/portfolio',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: ['Portfolio'],
        }),

        portfolioUpdate: build.mutation<PortfolioItemDto, { id: string; data: UpdatePortfolioItemRequest }>({
            query: ({ id, data }) => ({
                url: `/portfolio/${id}`,
                method: 'PUT',
                data,
            }),
            invalidatesTags: ['Portfolio'],
        }),

        portfolioDelete: build.mutation<DeletePortfolioItemResponse, string>({
            query: (id) => ({
                url: `/portfolio/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Portfolio'],
        }),

        portfolioReorder: build.mutation<PortfolioItemDto[], ReorderPortfolioRequest>({
            query: (body) => ({
                url: '/portfolio/reorder',
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: ['Portfolio'],
        }),
    }),
});

export const {
    usePortfolioByMasterQuery,
    usePortfolioTagsQuery,
    usePortfolioCreateMutation,
    usePortfolioUpdateMutation,
    usePortfolioDeleteMutation,
    usePortfolioReorderMutation,
} = portfolioApi;
