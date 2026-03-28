import { USER_ROLE } from '@/constants/roles';

/** User snapshot attached to audit log rows (from API). */
export type AuditActorUser = {
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
} | null;

/** Readable fallback when API could not resolve user (deleted, etc.) */
export function shortenAuditId(raw: string): string {
  const s = raw.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
    return `${s.slice(0, 8)}…${s.slice(-4)}`;
  }
  return s;
}

/** Do not expose full admin email in audit UIs (shared / screenshot risk). */
export function maskAuditEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at <= 0) return '***';
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!domain) return '***';
  if (local.length <= 1) return `*@${domain}`;
  return `${local[0]}***@${domain}`;
}

function maskPhoneLast4(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '···';
  return `···${digits.slice(-4)}`;
}

function isAdminActor(u: NonNullable<AuditActorUser>): boolean {
  return String(u.role ?? '').toUpperCase() === USER_ROLE.ADMIN;
}

/**
 * Human-readable actor line for audit tables / stream.
 * Prefers name + email; masks admin email; falls back to shortened UUID.
 */
export function formatAuditActorLabel(
  t: (key: string) => string,
  actorId: string | null | undefined,
  user?: AuditActorUser,
): string {
  const u = user;
  if (u && typeof u === 'object') {
    const email = u.email?.trim();
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    const admin = isAdminActor(u);

    if (admin) {
      if (name) return name;
      if (email) return maskAuditEmail(email);
      const phone = u.phone?.trim();
      if (phone) return maskPhoneLast4(phone);
    } else {
      if (name && email) return `${name} · ${email}`;
      if (email) return email;
      const phone = u.phone?.trim();
      if (phone) return phone;
    }
    const role = u.role != null ? String(u.role) : '';
    if (role) {
      return t(`admin.roles.${role}`);
    }
  }
  const raw = String(actorId ?? '').trim();
  const id = raw.toLowerCase();
  if (!id) return t('admin.audit.actorUnknown');
  if (id === 'system') return t('admin.audit.actorSystem');
  return shortenAuditId(raw);
}

export function auditActorLabelUsesMonoFont(label: string): boolean {
  return (
    label.includes('…') ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(label)
  );
}
