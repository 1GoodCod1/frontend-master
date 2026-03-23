export type ReportRow = {
  id: string;
  status?: string | null;
  reason?: string | null;
  description?: string | null;
  evidence?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  client?: {
    id?: string;
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarFile?: { path?: string | null } | null;
    clientPhotos?: Array<{ file?: { path?: string | null } | null }> | null;
  } | null;
  master?: {
    avatarUrl?: string | null;
    avatarFile?: { path?: string | null } | null;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
      avatarFile?: { path?: string | null } | null;
    } | null;
  } | null;
} & Record<string, unknown>;

export { useAdminReports } from './useAdminReports';
