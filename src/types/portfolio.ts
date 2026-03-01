export type PortfolioFileDto = {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
};

export type PortfolioItemDto = {
  id: string;
  masterId: string;
  title?: string | null;
  description?: string | null;
  beforeFileId: string;
  afterFileId: string;
  serviceTags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  beforeFile: PortfolioFileDto;
  afterFile: PortfolioFileDto;
};

export type CreatePortfolioItemRequest = {
  beforeFileId: string;
  afterFileId: string;
  title?: string;
  description?: string;
  serviceTags?: string[];
};

export type UpdatePortfolioItemRequest = {
  title?: string;
  description?: string;
  serviceTags?: string[];
  order?: number;
};

export type ReorderPortfolioRequest = { ids: string[] };

export type DeletePortfolioItemResponse = { deleted: true };

