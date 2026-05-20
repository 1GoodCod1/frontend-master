export const LEAD_STATUS_OPTIONS = ['NEW', 'IN_PROGRESS', 'PENDING_CLOSE', 'CLOSED', 'SPAM'] as const;
export type LeadStatus = (typeof LEAD_STATUS_OPTIONS)[number];
export type LeadFilterStatus = LeadStatus | 'ALL';

export type LeadDto = {
  id: string;
  status?: LeadStatus | string | null;
  createdAt?: string | null;
  message?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
  masterId?: string | null;
  client?: {
    avatarFile?: { path?: string | null } | null;
    clientPhotos?: Array<{ file?: { path?: string | null } | null }> | null;
  } | null;
  master?: {
    id?: string;
    /** URL-safe encoded ID for master profile links */
    encodedId?: string;
    slug?: string | null;
    avatarUrl?: string | null;
    avatarFile?: { path?: string | null } | null;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      email?: string | null;
      avatarFile?: { path?: string | null } | null;
    } | null;
    category?: { name?: string | null } | null;
  } | null;
  files?: Array<{ id?: string; path?: string | null }> | null;
} & Record<string, unknown>;

export type ActiveLeadToMasterResponse = LeadDto | null;

export type CompletedLeadToMasterResponse = {
  hasCompletedLead: boolean;
  lastLead: Pick<LeadDto, 'id' | 'status' | 'createdAt' | 'message'> | null;
};

export type LeadStatsResponse = {
  total: number;
  byStatus: { newLeads: number; inProgress: number; pendingClose: number; closed: number; spam: number };
};

export interface LeadCardProps {
  lead: LeadDto;
  onOpenReviewModal: (lead: LeadDto) => void;
  reviewsSubmittedMasterIds: Set<string>;
  pendingBooking?: import('@/types/bookings').BookingDto;
}

export interface LeadDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  onStatusChange?: () => void;
}

export interface LeadsStatusFilterProps {
  value: LeadFilterStatus;
  onChange: (value: LeadFilterStatus) => void;
}

export interface LeaveReviewButtonProps {
  lead: unknown;
}

export interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  lead: unknown | null;
  onSuccess?: () => void;
}

export interface LeadsEmptyStateProps {
  onReset?: () => void;
}

export interface LeadsFiltersProps {
  status: string;
  setStatus: (s: string) => void;
  dateFrom: string;
  setDateFrom: (s: string) => void;
  dateTo: string;
  setDateTo: (s: string) => void;
}

export interface BulkActionsLeadsProps {
  selection: string[];
  onBulkStatus: (status: LeadStatus) => void;
  onClearSelection: () => void;
}

export interface StatisticsCardsLeadsProps {
  total: number;
  newCount: number;
  inProgressCount: number;
  closedCount: number;
}
