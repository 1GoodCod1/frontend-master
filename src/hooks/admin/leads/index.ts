import type { LeadStatus } from '@/types/leads';
import { LEAD_STATUS_OPTIONS } from '@/types/leads';

export type StatusOption = LeadStatus;

export type AdminLeadRow = {
  id: string;
  status?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
  name?: string | null;
  phone?: string | null;
  message?: string | null;
  isPremium?: boolean | null;
  createdAt?: string | null;
  master?: {
    avatarFile?: { path?: string | null } | null;
    avatarUrl?: string | null;
    user?: { firstName?: string | null; lastName?: string | null } | null;
  } | null;
} & Record<string, unknown>;

export const STATUS_OPTIONS = LEAD_STATUS_OPTIONS;

export { useAdminLeads } from './useAdminLeads';
