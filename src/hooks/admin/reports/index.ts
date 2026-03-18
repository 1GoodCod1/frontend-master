export type ReportRow = {
  id: string;
  status?: string | null;
  reason?: string | null;
  description?: string | null;
  createdAt?: string | null;
  client?: { email?: string | null } | null;
  master?: { user?: { firstName?: string | null; lastName?: string | null } | null } | null;
} & Record<string, unknown>;

export { useAdminReports } from './useAdminReports';
