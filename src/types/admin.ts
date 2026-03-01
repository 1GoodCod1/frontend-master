export interface StatisticsCardsProps {
  total: number;
  data: Array<{ label: string; value: number | string; color?: string }>;
  loading?: boolean;
}

export interface BulkActionsProps {
  bulkIdsLength: number;
  onCreate: () => void;
  onToggle?: () => void;
  onDelete: () => void;
}

export interface CreatedAtCellProps {
  createdAt: string | null | undefined;
  locale?: string;
}

export interface SubmittedAtCellProps {
  submittedAt: string | undefined;
}

export interface ActionsCellProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export interface EmptyStateAdminProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export interface FiltersAdminProps {
  [key: string]: unknown;
}

export interface SystemStats {
  database?: Record<string, unknown>;
  redis?: Record<string, unknown>;
  [key: string]: unknown;
}
