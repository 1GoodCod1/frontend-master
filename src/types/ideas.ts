export enum IdeaStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IMPLEMENTED = 'IMPLEMENTED',
}

export enum IdeaStatusFilter {
  ALL = 'ALL',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IMPLEMENTED = 'IMPLEMENTED',
}

export enum IdeaSortBy {
  VOTES = 'VOTES',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface IdeaAuthor {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  masterProfile?: {
    id: string;
  };
}

export interface IdeaVote {
  userId: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  authorId: string;
  author: IdeaAuthor;
  votesCount: number;
  votes: IdeaVote[];
  hasVoted?: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  implementedAt?: string;
  adminNote?: string;
}

export interface IdeasResponse {
  ideas: Idea[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateIdeaDto {
  title: string;
  description: string;
}

export interface UpdateIdeaStatusDto {
  status: IdeaStatus;
  adminNote?: string;
}

export interface QueryIdeasDto {
  status?: IdeaStatusFilter;
  sortBy?: IdeaSortBy;
  page?: number;
  limit?: number;
}
