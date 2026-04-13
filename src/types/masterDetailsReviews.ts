import type { Dispatch, SetStateAction } from 'react';
import type {
  CriteriaRatings,
  ReviewCriteriaKey,
  ReviewCanCreateResponse,
} from '@/types/reviews';

export type ReviewFile = { id?: string; file?: { path?: string; url?: string } };

export type ReviewReply = {
  id?: string;
  content?: string;
  createdAt?: string | Date;
};

export type ReviewSubmissionState = {
  reviewRating: number;
  setReviewRating: (v: number) => void;
  reviewComment: string;
  setReviewComment: (v: string) => void;
  reviewPhotos: File[];
  setReviewPhotos: Dispatch<SetStateAction<File[]>>;
  criteriaRatings: CriteriaRatings;
  setCriterionRating: (key: ReviewCriteriaKey, value: number) => void;
  handleCreateReview: () => Promise<void>;
  isLoading: boolean;
};

export interface MasterDetailsReviewsProps {
  reviews: Record<string, unknown>[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  isClient: boolean;
  isMaster?: boolean;
  canCreateReview?: ReviewCanCreateResponse | undefined;
  reviewSubmission: ReviewSubmissionState;
}
