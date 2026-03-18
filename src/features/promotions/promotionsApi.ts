import { api } from '@/services/api';
import type {
  ApiEnvelope,
  CreatePromotionRequest,
  DeletePromotionResponse,
  PromotionDto,
  UpdatePromotionRequest,
} from '@/types';
import { extractItems, unwrapOne } from '@/utils/data';

export const promotionsApi = api.injectEndpoints({
    endpoints: (build) => ({
        promotionsActive: build.query<PromotionDto[], { limit?: number } | void>({
            query: (params) => ({ url: '/promotions/active', method: 'GET', params: params ?? {} }),
            transformResponse: (raw: ApiEnvelope<PromotionDto[]> | PromotionDto[]) => extractItems<PromotionDto>(raw),
            providesTags: ['Promotions'],
        }),
        promotionsMy: build.query<PromotionDto[], void>({
            query: () => ({ url: '/promotions/my', method: 'GET' }),
            transformResponse: (raw: ApiEnvelope<PromotionDto[]> | PromotionDto[]) => extractItems<PromotionDto>(raw),
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
                const arr = Array.isArray(raw) ? raw : unwrapOne<PromotionDto[]>(raw);
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
