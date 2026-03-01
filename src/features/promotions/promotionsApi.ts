import { api } from '@/services/api';
import type {
  ApiEnvelope,
  CreatePromotionRequest,
  DeletePromotionResponse,
  PromotionDto,
  UpdatePromotionRequest,
} from '@/types';

function unwrapArray<T>(raw: ApiEnvelope<T[]> | T[]): T[] {
    if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
        const envelope = raw as { data?: T[] };
        return Array.isArray(envelope.data) ? envelope.data : [];
    }
    return Array.isArray(raw) ? raw : [];
}

function unwrapOne<T>(raw: ApiEnvelope<T> | T | null): T | null {
    if (raw == null) return null;
    if (typeof raw === 'object' && 'data' in (raw as object)) {
        const d = (raw as { data?: T }).data;
        return d !== undefined && d !== null ? d : null;
    }
    return raw as T;
}

export const promotionsApi = api.injectEndpoints({
    endpoints: (build) => ({
        promotionsActive: build.query<PromotionDto[], { limit?: number } | void>({
            query: (params) => ({ url: '/promotions/active', method: 'GET', params: params ?? {} }),
            transformResponse: (raw: ApiEnvelope<PromotionDto[]> | PromotionDto[]) => unwrapArray(raw),
            providesTags: ['Promotions'],
        }),
        promotionsMy: build.query<PromotionDto[], void>({
            query: () => ({ url: '/promotions/my', method: 'GET' }),
            transformResponse: (raw: ApiEnvelope<PromotionDto[]> | PromotionDto[]) => unwrapArray(raw),
            providesTags: ['Promotions'],
        }),
        promotionsCreate: build.mutation<PromotionDto, CreatePromotionRequest>({
            query: (body) => ({ url: '/promotions', method: 'POST', data: body }),
            invalidatesTags: ['Promotions'],
        }),
        promotionsUpdate: build.mutation<PromotionDto, { id: string; body: UpdatePromotionRequest }>({
            query: ({ id, body }) => ({ url: `/promotions/${id}`, method: 'PUT', data: body }),
            invalidatesTags: ['Promotions'],
        }),
        promotionsDelete: build.mutation<DeletePromotionResponse, string>({
            query: (id) => ({ url: `/promotions/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Promotions'],
        }),
        promotionForMaster: build.query<PromotionDto[], { masterId: string }>({
            query: ({ masterId }) => ({ url: `/promotions/master/${masterId}`, method: 'GET' }),
            transformResponse: (raw: ApiEnvelope<PromotionDto[]> | PromotionDto[] | null): PromotionDto[] => {
                const arr = Array.isArray(raw) ? raw : unwrapOne(raw as ApiEnvelope<PromotionDto[]>);
                if (!Array.isArray(arr)) return [];
                return arr.filter((d) => d && typeof d.discount === 'number');
            },
            providesTags: (_result, _err, { masterId }) => [{ type: 'Promotions', id: `master-${masterId}` }],
        }),
    }),
});

export const {
    usePromotionsActiveQuery,
    usePromotionsMyQuery,
    usePromotionsCreateMutation,
    usePromotionsUpdateMutation,
    usePromotionsDeleteMutation,
    usePromotionForMasterQuery,
} = promotionsApi;
