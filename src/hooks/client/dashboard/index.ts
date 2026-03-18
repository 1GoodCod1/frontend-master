type UserName = { firstName?: string | null; lastName?: string | null };
type MasterRef = {
  id?: string;
  user?: UserName | null;
  name?: string | null;
};

export type ClientBooking = {
  id: string;
  status?: string;
  createdAt?: string;
  startTime?: string;
  masterId?: string;
  master?: MasterRef | null;
  isReviewed?: boolean;
};

export type ClientLead = {
  id: string;
  status?: string;
  createdAt?: string;
  masterId?: string;
  master?: MasterRef | null;
};

export type ClientReview = {
  id: string;
  createdAt?: string;
  rating?: number;
  status?: string;
  masterId?: string;
  master?: MasterRef | null;
};

export { useClientDashboard } from './useClientDashboard';
