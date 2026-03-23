import type { ReviewStatus } from '@/types/reviews';
import { REVIEW_STATUS_OPTIONS } from '@/types/reviews';

export type StatusOption = ReviewStatus;

export type AdminReviewRow = {
  id: string;
  masterId?: string | null;
  clientName?: string | null;
  rating?: number | null;
  comment?: string | null;
  createdAt?: string | null;
  master?: {
    id?: string | null;
    slug?: string | null;
    avatarUrl?: string | null;
    avatarFile?: { path?: string | null } | null;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      avatarFile?: { path?: string | null } | null;
    } | null;
  } | null;
  client?: {
    avatarFile?: { path?: string | null } | null;
    clientPhotos?: Array<{ file?: { path?: string | null } | null }> | null;
  } | null;
} & Record<string, unknown>;

export const STATUS_OPTIONS = REVIEW_STATUS_OPTIONS;

export { useAdminReviews } from './useAdminReviews';
