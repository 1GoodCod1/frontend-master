import { api } from '@/services/api';
import type {
  ActiveLeadToMasterResponse,
  CompletedLeadToMasterResponse,
  CreateLeadDto,
  LeadDto,
  LeadStatsResponse,
  UpdateLeadStatusDto,
} from '@/types';
import { idMatches } from '@/services/cacheUtils';
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
      invalidatesTags: ['Leads'],
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled, getState }) {
        const patches: Array<{ undo: () => void }> = [];

        const statusFilterFromArg = (arg: unknown): string | undefined => {
          if (!isRecord(arg)) return undefined;
          const s = arg.status;
          return typeof s === 'string' ? s : undefined;
        };

        /** Update or drop list item so UI matches filters immediately (e.g. IN_PROGRESS → CLOSED removes row). */
        const applyListUpdate = (draft: LeadDto[], arg: unknown) => {
          const idx = draft.findIndex((it) => idMatches(it, id));
          if (idx === -1) return;
          const filterStatus = statusFilterFromArg(arg);
          if (filterStatus && body.status !== filterStatus) {
            draft.splice(idx, 1);
          } else {
            draft[idx].status = body.status;
          }
        };

        const cachedListArgs = leadsApi.util.selectCachedArgsForQuery(getState(), 'leadsMyList');
        for (const arg of cachedListArgs) {
          const patchResult = dispatch(
            leadsApi.util.updateQueryData('leadsMyList', arg, (draft) => {
              if (!Array.isArray(draft)) return;
              applyListUpdate(draft, arg);
            }),
          );
          if (
            patchResult &&
            typeof patchResult === 'object' &&
            'undo' in patchResult &&
            typeof (patchResult as { undo: unknown }).undo === 'function'
          ) {
            patches.push(patchResult as { undo: () => void });
          }
        }

        try {
          const patchResult = dispatch(
            leadsApi.util.updateQueryData('leadsById', { id }, (draft) => {
              if (draft && typeof draft === 'object') (draft as LeadDto).status = body.status;
            }),
          );
          if (
            patchResult &&
            typeof patchResult === 'object' &&
            'undo' in patchResult &&
            typeof (patchResult as { undo: unknown }).undo === 'function'
          ) {
            patches.push(patchResult as { undo: () => void });
          }
        } catch {
          // No cache entry for this id
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    leadsSubscribeToAvailability: build.mutation<unknown, { masterId: string }>({
      query: (body) => ({ url: '/leads/subscribe-availability', method: 'POST', data: body }),
      invalidatesTags: (_r, _e, { masterId }) => [{ type: 'AvailabilitySubscription' as const, id: masterId }],
    }),

    leadsUnsubscribeFromAvailability: build.mutation<unknown, { masterId: string }>({
      query: ({ masterId }) => ({ url: `/leads/unsubscribe-availability/${masterId}`, method: 'POST' }),
      invalidatesTags: (_r, _e, { masterId }) => [{ type: 'AvailabilitySubscription' as const, id: masterId }],
    }),

    leadsCheckAvailabilitySubscription: build.query<{ subscribed: boolean }, { masterId: string }>({
      query: ({ masterId }) => ({ url: `/leads/availability-subscription/${masterId}`, method: 'GET' }),
      providesTags: (_r, _e, { masterId }) => [{ type: 'AvailabilitySubscription' as const, id: masterId }],
      transformResponse: (raw: unknown) => {
        const obj = unwrapObject<{ subscribed?: boolean }>(raw);
        return { subscribed: !!obj?.subscribed };
      },
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

    // Check if client has a completed (CLOSED) lead to a specific master (for "re-contact" button)
    leadsCompletedToMaster: build.query<CompletedLeadToMasterResponse, { masterId: string; userId?: string }>({
      query: ({ masterId }) => ({ url: `/leads/completed-to-master/${masterId}`, method: 'GET' }),
      providesTags: ['Leads'],
      transformResponse: (raw: unknown) => {
        const obj = unwrapObject<CompletedLeadToMasterResponse>(raw);
        return obj ?? { hasCompletedLead: false, lastLead: null };
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
  useLeadsCheckAvailabilitySubscriptionQuery,
  useLeadsActiveToMasterQuery,
  useLeadsCompletedToMasterQuery,
} = leadsApi;
