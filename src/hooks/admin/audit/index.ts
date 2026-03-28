export type AuditLogRow = {
  id?: string;
  action?: string | null;
  entity?: string | null;
  entityId?: string | null;
  actorId?: string | null;
  ip?: string | null;
  ua?: string | null;
  createdAt?: string | number | null;
  user?: {
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
} & Record<string, unknown>;

export { useAdminAudit } from './useAdminAudit';
