import {
  LEAD_STATUS_OPTIONS,
  type LeadStatus,
  type LeadFilterStatus,
} from '@/types/leads';

export const STATUS_OPTIONS = LEAD_STATUS_OPTIONS;
export type Status = LeadStatus;
export type FilterStatus = LeadFilterStatus;

export type ClientLeadListItem = { id: string } & Record<string, unknown>;

export type ReviewModalMaster = { id: string; user?: { firstName?: string; lastName?: string } } | null;

export { useClientLeads } from './useClientLeads';
export { useReviewModal } from './useReviewModal';
