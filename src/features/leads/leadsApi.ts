import { api } from '@/services/api';
import type {
  ActiveLeadToMasterResponse,
  CreateLeadDto,
  LeadDto,
  LeadStatsResponse,
  UpdateLeadStatusDto,
} from '@/types';
import { patchInListResponse, idMatches } from '@/services/cacheUtils';
import { isRecord } from '@/utils/guards';
import { unwrapObject, extractItems } from '@/utils/data';

export const leadsApi = api.injectEndpoints({
  endpoints: (build) => ({
    leadsCreate: build.mutation<LeadDto, CreateLeadDto>({
      query: (body) => ({ url: '/leads', method: 'POST', data: body }),
      invalidatesTags: ['Leads'],
      transformResponse: (raw: unknown) => {
        const lead = unwrapObject<unknown>(raw);
        return (isRecord(lead) ? lead : { id: '' }) as LeadDto;
      },
    }),

    leadsMyList: build.query<
      LeadDto[],
      { limit?: number; page?: number; status?: string } | void
    >({
      query: (params) => ({ url: '/leads', method: 'GET', params: params ?? {} }),
      providesTags: ['Leads'],
      transformResponse: (raw: unknown) => extractItems<LeadDto>(raw),
    }),

    leadsById: build.query<LeadDto | null, { id: string }>({
      query: ({ id }) => ({ url: `/leads/${id}`, method: 'GET' }),
      providesTags: (_r, _e, a) => [{ type: 'Leads', id: a.id }],
      transformResponse: (raw: unknown) => {
        const lead = unwrapObject<unknown>(raw);
        if (isRecord(lead) && typeof lead.id === 'string') return lead as LeadDto;
        return null;
      },
    }),

    leadsStats: build.query<LeadStatsResponse, void>({
      query: () => ({ url: '/leads/stats', method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapObject<LeadStatsResponse>(raw),
      providesTags: ['Leads'],
    }),

    leadsUpdateStatus: build.mutation<LeadDto, { id: string; body: UpdateLeadStatusDto }>({
      query: ({ id, body }) => ({ url: `/leads/${id}/status`, method: 'PATCH', data: body }),
      invalidatesTags: ['Leads', 'Master'],
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const patcher = (args: { limit?: number; page?: number; status?: string } | void) =>
          dispatch(
            leadsApi.util.updateQueryData('leadsMyList', args, (draft) => {
              patchInListResponse<LeadDto>(draft, (it) => idMatches(it, id), (it) => {
                it.status = body.status;
              });
            }),
          );

        const patches = [
          patcher(undefined),
          patcher({ status: 'NEW' }),
          patcher({ status: 'IN_PROGRESS' }),
          patcher({ status: 'CLOSED' }),
          patcher({ status: 'SPAM' }),
        ];

        let byIdPatch: { undo: () => void } | undefined;
        try {
          byIdPatch = dispatch(
            leadsApi.util.updateQueryData('leadsById', { id }, (draft) => {
              if (draft && typeof draft === 'object') (draft as LeadDto).status = body.status;
            }),
          );
        } catch {
          // No cache entry for this id
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
          byIdPatch?.undo();
        }
      },
    }),

    leadsSubscribeToAvailability: build.mutation<unknown, { masterId: string }>({
      query: (body) => ({ url: '/leads/subscribe-availability', method: 'POST', data: body }),
    }),

    leadsUnsubscribeFromAvailability: build.mutation<unknown, { masterId: string }>({
      query: ({ masterId }) => ({ url: `/leads/unsubscribe-availability/${masterId}`, method: 'POST' }),
    }),

    // Check if client has an active lead to a specific master (args include userId so cache is per-user)
    leadsActiveToMaster: build.query<ActiveLeadToMasterResponse, { masterId: string; userId?: string }>({
      query: ({ masterId }) => ({ url: `/leads/active-to-master/${masterId}`, method: 'GET' }),
      providesTags: ['Leads'],
      transformResponse: (raw: unknown) => {
        const lead = unwrapObject<unknown>(raw);
        if (isRecord(lead) && typeof lead.id === 'string') return lead as LeadDto;
        return null;
      },
    }),
  }),
});

export const {
  useLeadsCreateMutation,
  useLeadsMyListQuery,
  useLeadsStatsQuery,
  useLeadsUpdateStatusMutation,
  useLeadsByIdQuery,
  useLeadsSubscribeToAvailabilityMutation,
  useLeadsUnsubscribeFromAvailabilityMutation,
  useLeadsActiveToMasterQuery,
} = leadsApi;
