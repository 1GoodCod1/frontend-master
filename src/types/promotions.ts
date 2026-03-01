export type PromotionDto = {
  id: string;
  masterId: string;
  title: string;
  description: string;
  discount: number;
  serviceTitle?: string | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  master?: {
    id: string;
    slug?: string | null;
    rating?: number | null;
    totalReviews?: number | null;
    avatarFileId?: string | null;
    user?: { firstName?: string | null; lastName?: string | null } | null;
    city?: { name?: string | null } | null;
    category?: { name?: string | null } | null;
    photos?: Array<{ file: { path?: string | null } }>;
  } | null;
};

export type CreatePromotionRequest = {
  title: string;
  description: string;
  discount: number;
  serviceTitle?: string | null;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
};

export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;

export type DeletePromotionResponse = { deleted: true };

