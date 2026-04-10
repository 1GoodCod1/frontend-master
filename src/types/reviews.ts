export const REVIEW_CRITERIA_KEYS = ['quality', 'speed', 'price', 'politeness'] as const;
export type ReviewCriteriaKey = (typeof REVIEW_CRITERIA_KEYS)[number];

export type CriteriaRatings = Record<ReviewCriteriaKey, number>;

export function createDefaultCriteriaRatings(): CriteriaRatings {
  return { quality: 0, speed: 0, price: 0, politeness: 0 };
}

export const REVIEW_STATUS_OPTIONS = ['PENDING', 'VISIBLE', 'HIDDEN', 'REPORTED'] as const;
export type ReviewStatus = (typeof REVIEW_STATUS_OPTIONS)[number];
export type ReviewFilterStatus = ReviewStatus | 'ALL';

export type ReviewCriteriaDto = {
  id: string;
  criteria: string;
  rating: number;
  createdAt: string;
};

export type ReviewFileDto = {
  id: string;
  file: {
    id: string;
    path: string;
    mimetype: string;
    filename: string;
  };
};

export type ReviewReplyDto = {
  id: string;
  reviewId: string;
  masterId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewVoteDto = {
  id: string;
  reviewId: string;
  userId: string;
  createdAt: string;
};

export type ReviewDto = {
  id: string;
  masterId: string;
  clientPhone: string;
  clientName?: string | null;
  clientId?: string | null;
  rating: number;
  comment?: string | null;
  status: ReviewStatus;
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  master?: {
    avatarUrl?: string | null;
    avatarFile?: { path?: string | null } | null;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      avatarFile?: { path?: string | null } | null;
    } | null;
  } | null;
  client?: {
    firstName?: string | null;
    lastName?: string | null;
    avatarFile?: { path?: string | null } | null;
    clientPhotos?: Array<{ file?: { path?: string | null } | null }> | null;
  } | null;

  reviewCriteria?: ReviewCriteriaDto[];
  reviewFiles?: ReviewFileDto[];
  replies?: ReviewReplyDto[];
  votes?: ReviewVoteDto[];
  _count?: { votes: number };
};

export type ReviewCanCreateResponse = {
  canCreate: boolean;
  alreadyReviewed?: boolean;
  noClosedLead?: boolean;
  leadId?: string;
};

export type ReviewStatsResponse = {
  total: number;
  byStatus: { visible: number; pending: number; hidden: number; reported: number };
  ratingDistribution: Record<number, number>;
};

export type ReviewReplyResponse = ReviewReplyDto;
export type ReviewDeleteReplyResponse = { deleted: true };

export type ReviewVoteHelpfulResponse = ReviewVoteDto & { votesCount: number };
export type ReviewRemoveVoteResponse = { deleted: true; votesCount: number };

export interface ReviewsSectionProps {
  masterId: string;
  canCreate?: boolean;
}

export interface ReviewDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  reviewId: string | null;
  onStatusChange?: () => void;
}

export interface ReviewsEmptyStateProps {
  onReset?: () => void;
}

export interface ReviewsFiltersProps {
  status: string;
  setStatus: (s: string) => void;
}

export interface StatisticsCardsReviewsProps {
  total: number;
  pending: number;
  visible: number;
  hidden: number;
  reported: number;
}
