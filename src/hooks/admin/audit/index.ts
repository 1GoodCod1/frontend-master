export type AuditLogRow = {
  id?: string;
  action?: string | null;
  entity?: string | null;
  entityId?: string | null;
  actorId?: string | null;
  ip?: string | null;
  ua?: string | null;
  createdAt?: string | number | null;
} & Record<string, unknown>;

export { useAdminAudit } from './useAdminAudit';
