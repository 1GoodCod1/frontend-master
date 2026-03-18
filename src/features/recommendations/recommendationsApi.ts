import { api } from '@/services/api';
import type {
  RecommendedMasterDto,
  TrackRecommendationActivityRequest,
  TrackRecommendationActivityResponse,
} from '@/types';
import { extractItems } from '@/utils/data';

export const recommendationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    recommendationsPersonalized: build.query<RecommendedMasterDto[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: '/recommendations/personalized', method: 'GET', params: { limit },
      }),
      transformResponse: (raw: unknown) => extractItems<RecommendedMasterDto>(raw),
      providesTags: ['Recommendations'],
    }),

    recommendationsSimilar: build.query<RecommendedMasterDto[], { masterId: string; limit?: number }>({
      query: ({ masterId, limit = 5 }) => ({
        url: `/recommendations/similar/${masterId}`, method: 'GET', params: { limit },
      }),
      transformResponse: (raw: unknown) => extractItems<RecommendedMasterDto>(raw),
    }),

    recommendationsRecentlyViewed: build.query<RecommendedMasterDto[], { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: '/recommendations/recently-viewed', method: 'GET', params: { limit },
      }),
      transformResponse: (raw: unknown) => extractItems<RecommendedMasterDto>(raw),
    }),

    recommendationsTrack: build.mutation<TrackRecommendationActivityResponse, TrackRecommendationActivityRequest>({
      query: (body) => ({
        url: '/recommendations/track', method: 'POST', data: body,
      }),
      invalidatesTags: ['Recommendations'],
    }),
  }),
});

export const {
  useRecommendationsPersonalizedQuery,
  useRecommendationsSimilarQuery,
  useRecommendationsRecentlyViewedQuery,
  useRecommendationsTrackMutation,
} = recommendationsApi;
