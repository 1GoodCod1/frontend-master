import type { PublicMaster } from './masters';

export type RecommendedMasterDto = PublicMaster & {
  recommendationScore?: number;
  reasons?: string[];
};

export type TrackRecommendationActivityRequest = {
  action: 'filter' | 'search';
  searchQuery?: string;
  categoryId?: string;
  cityId?: string;
};

export type TrackRecommendationActivityResponse = { success: true };

