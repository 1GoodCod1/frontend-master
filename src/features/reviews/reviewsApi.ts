import { api } from '@/services/api';
import type {
  ApiEnvelope,
  CreateReviewDto,
  UpdateReviewStatusDto,
  ReviewCanCreateResponse,
  ReviewDeleteReplyResponse,
  ReviewDto,
  ReviewRemoveVoteResponse,
  ReviewReplyResponse,
  ReviewStatsResponse,
  ReviewVoteHelpfulResponse,
} from '@/types';
import { patchInListResponse, idMatches } from '@/services/cacheUtils';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function unwrapEnvelope<T>(raw: ApiEnvelope<T> | unknown): T {
  if (isRecord(raw) && 'data' in raw) {
    const d = (raw as { data?: T }).data;
    return (d ?? (raw as unknown as T)) as T;
  }
  return raw as T;
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (build) => ({
    reviewsCanCreate: build.query<
      ReviewCanCreateResponse,
      string
    >({
      query: (masterId) => ({ url: `/reviews/can-create/${masterId}`, method: 'GET' }),
      transformResponse: (response: unknown): ReviewCanCreateResponse => {
        const data = unwrapEnvelope<unknown>(response);
        const root = isRecord(data) ? data : {};
        return {
          canCreate: root.canCreate === true,
          alreadyReviewed: root.alreadyReviewed === true ? true : undefined,
          noClosedLead: root.noClosedLead === true ? true : undefined,
        };
      },
      providesTags: (_r, _e, masterId) => [{ type: 'Reviews', id: `can-create-${masterId}` }],
    }),
    reviewsCreate: build.mutation<ReviewDto, CreateReviewDto>({
      query: (body) => ({ url: '/reviews', method: 'POST', data: body }),
      invalidatesTags: (_result, _err, arg) => [
        'Reviews',
        'Masters',
        'Master',
        { type: 'Reviews' as const, id: `can-create-${arg.masterId}` },
      ],
    }),
    reviewsForMaster: build.query<ReviewDto[], { masterId: string; status?: 'VISIBLE' | 'PENDING' | 'HIDDEN' | 'REPORTED' }>({
      query: ({ masterId, status }) => ({ url: `/reviews/master/${masterId}`, method: 'GET', params: status ? { status } : {} }),
      transformResponse: (raw: unknown): ReviewDto[] => {
        const inner = unwrapEnvelope<unknown>(raw);
        if (Array.isArray(inner)) return inner as ReviewDto[];
        const paginated = isRecord(inner) && 'items' in inner ? (inner as { items?: unknown[] }).items : undefined;
        return Array.isArray(paginated) ? (paginated as ReviewDto[]) : [];
      },
      providesTags: (_r, _e, a) => [{ type: 'Reviews', id: a.masterId }],
    }),
    reviewsStats: build.query<ReviewStatsResponse, { masterId: string }>({
      query: ({ masterId }) => ({ url: `/reviews/stats/${masterId}`, method: 'GET' }),
      transformResponse: (raw: unknown) => unwrapEnvelope<ReviewStatsResponse>(raw),
    }),
    reviewsUpdateStatus: build.mutation<ReviewDto, { id: string; body: UpdateReviewStatusDto }>({
      query: ({ id, body }) => ({ url: `/reviews/${id}/status`, method: 'PUT', data: body }),
      invalidatesTags: ['Reviews'],

      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        const patchMy = dispatch(
          reviewsApi.util.updateQueryData('reviewsMy', undefined, (draft) => {
            patchInListResponse<ReviewDto>(draft, (it) => idMatches(it, id), (it) => {
              it.status = body.status as ReviewDto['status'];
            });
          }),
        );
        const patches = [patchMy];
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),
    reviewsMy: build.query<ReviewDto[], void>({
      query: () => ({ url: '/reviews/my-reviews', method: 'GET' }),
      transformResponse: (raw: unknown): ReviewDto[] => {
        const inner = unwrapEnvelope<unknown>(raw);
        return Array.isArray(inner) ? (inner as ReviewDto[]) : [];
      },
      providesTags: ['Reviews'],
    }),

    // ============================================
    // REVIEW REPLIES
    // ============================================

    reviewReply: build.mutation<ReviewReplyResponse, { reviewId: string; content: string }>({
      query: ({ reviewId, content }) => ({
        url: `/reviews/${reviewId}/reply`,
        method: 'POST',
        data: { content },
      }),
      invalidatesTags: ['Reviews'],
    }),
    reviewDeleteReply: build.mutation<ReviewDeleteReplyResponse, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/reply`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),

    // ============================================
    // REVIEW VOTES (Helpful)
    // ============================================

    reviewVoteHelpful: build.mutation<ReviewVoteHelpfulResponse, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/vote`,
        method: 'POST',
      }),
      invalidatesTags: ['Reviews'],
    }),
    reviewRemoveVote: build.mutation<ReviewRemoveVoteResponse, string>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/vote`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
});

export const {
  useReviewsCanCreateQuery,
  useReviewsCreateMutation,
  useReviewsForMasterQuery,
  useReviewsStatsQuery,
  useReviewsUpdateStatusMutation,
  useReviewsMyQuery,
  useReviewReplyMutation,
  useReviewDeleteReplyMutation,
  useReviewVoteHelpfulMutation,
  useReviewRemoveVoteMutation,
} = reviewsApi;
