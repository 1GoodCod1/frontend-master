import type { ReviewStatus } from '@/types/reviews';
import { REVIEW_STATUS_OPTIONS } from '@/types/reviews';

export type StatusOption = ReviewStatus;

export type AdminReviewRow = {
  id: string;
  status?: string | null;
  clientName?: string | null;
  rating?: number | null;
  comment?: string | null;
  createdAt?: string | null;
  master?: { user?: { firstName?: string | null; lastName?: string | null } | null } | null;
} & Record<string, unknown>;

export const STATUS_OPTIONS = REVIEW_STATUS_OPTIONS;

export { useAdminReviews } from './useAdminReviews';
