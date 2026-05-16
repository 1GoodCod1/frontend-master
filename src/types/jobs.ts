export type JobType = 'FIXED_PRICE' | 'HOURLY';
export type JobStatus = 'OPEN' | 'FOUND' | 'PENDING_CLOSE' | 'CLOSED';
export type ApplicationPaymentType = 'FULL' | 'PARTIAL';
export type ApplicationStatus = 'PENDING' | 'SELECTED' | 'REJECTED';
export type JointsTransactionType =
  | 'SUBSCRIPTION_CREDIT'
  | 'PURCHASE'
  | 'APPLICATION_SPEND'
  | 'REFUND';

export interface JobPhotoDto {
  id: string;
  order: number;
  file: { id: string; path: string; filename: string };
}

export interface JobDto {
  id: string;
  clientId: string;
  title: string;
  description: string;
  type: JobType;
  budget: number | null;
  hourlyRate: number | null;
  minJoints: number;
  status: JobStatus;
  selectedApplicationId: string | null;
  photos: JobPhotoDto[];
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarFile: { path: string } | null;
  };
  cityId: string | null;
  city: { id: string; name: string } | null;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    iconKey?: string | null;
    translations?: unknown;
  } | null;
  _count: { applications: number };
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationPhotoDto {
  id: string;
  order: number;
  file: { id: string; path: string; filename: string };
}

export interface JobApplicationDto {
  id: string;
  jobId: string;
  masterId: string;
  jointsSpent: number;
  description: string;
  paymentType: ApplicationPaymentType;
  deadline?: number | null;
  milestones?: MilestoneDto[] | null;
  status: ApplicationStatus;
  viewedAt: string | null;
  rank: number;
  isAnonymous: boolean;
  job?: JobDto;
  master: {
    id: string;
    userId: string;
    rating: number;
    totalReviews: number;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      avatarFile: { path: string } | null;
    };
    city: { id: string; name: string };
    category: { id: string; name: string };
  } | null;
  photos: JobApplicationPhotoDto[];
  createdAt: string;
}

export interface CreateJobDto {
  title: string;
  description: string;
  type: JobType;
  budget?: number;
  hourlyRate?: number;
  minJoints: number;
  cityId?: string;
  categoryId: string;
  photoFileIds?: string[];
}

export interface MilestoneDto {
  title: string;
  description?: string;
  price: number;
  dueDate: string;
}

export interface UpdateJobApplicationDto {
  description?: string;
  deadline?: number;
  milestones?: MilestoneDto[];
  jointsSpent?: number;
}

export interface CreateJobApplicationDto {
  jointsSpent: number;
  description: string;
  paymentType: ApplicationPaymentType;
  deadline?: number;
  milestones?: MilestoneDto[];
  photoFileIds?: string[];
}

export interface JobsListResponse {
  items: JobDto[];
  total: number;
  page: number;
  limit: number;
}

export interface JobApplicationsResponse {
  job: JobDto;
  applications: JobApplicationDto[];
}

export interface JointsBalanceDto {
  balance: number;
}

export interface JointsTransactionDto {
  id: string;
  masterId: string;
  amount: number;
  type: JointsTransactionType;
  description: string | null;
  applicationId: string | null;
  paymentId: string | null;
  createdAt: string;
}

export interface JointsTransactionsResponse {
  items: JointsTransactionDto[];
  total: number;
  page: number;
  limit: number;
}
