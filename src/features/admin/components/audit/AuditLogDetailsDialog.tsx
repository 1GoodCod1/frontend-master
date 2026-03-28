import { useTranslation } from 'react-i18next';
import { Shield, User, FileText, MapPin, Monitor } from 'lucide-react';
import { formatAuditActorLabel } from '@/utils/auditDisplay';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';

type AuditLogLike = {
  action?: string | null;
  entity?: string | null;
  actorId?: string | null;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  ua?: string | null;
  data?: unknown;
  createdAt?: string | number | null;
  user?: {
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
} & Record<string, unknown>;

interface AuditLogDetailsDialogProps {
  open: boolean;
  log: AuditLogLike | null;
  onClose: () => void;
}

export default function AuditLogDetailsDialog({
  open,
  log,
  onClose,
}: AuditLogDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);

  if (!log) return null;

  const actionRaw = String(log.action ?? '').trim();
  const entityRaw = String(log.entity ?? '').trim();
  const actionLabel = actionRaw
    ? t(`admin.users.auditAction_${actionRaw}`, actionRaw)
    : '—';
  const entityLabel = entityRaw
    ? t(`admin.audit.entityType_${entityRaw}`, entityRaw)
    : '—';
  const actorDisplay = formatAuditActorLabel(t, log.actorId, log.user);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md sm:max-w-lg md:max-w-2xl"
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="size-4" />
            </div>
            {t('admin.audit.detailsTitle')}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div
            className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75 fill-mode-backwards"
          >
            <Badge variant="secondary" className="font-semibold px-3 py-1 max-w-full whitespace-normal text-center">
              {actionLabel}
            </Badge>
            <Badge variant="outline" className="font-semibold px-3 py-1 border-primary/50 text-primary max-w-full whitespace-normal text-center">
              {entityLabel}
            </Badge>
          </div>

          {(log.actorId || log.user) && (
            <div
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-backwards"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="size-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{t('admin.audit.actor')}</p>
              </div>
              <p className="text-sm font-medium text-foreground ml-7 leading-snug">{actorDisplay}</p>
              {log.actorId && (
                <p className="text-[11px] text-muted-foreground font-mono ml-7 mt-1 break-all">
                  {t('admin.audit.actorIdTechnical')}: {log.actorId}
                </p>
              )}
            </div>
          )}

          {log.entityId && (
            <div
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-backwards"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{t('admin.audit.entityIdLabel')}</p>
              </div>
              <p className="text-sm font-mono ml-7 break-all">{log.entityId}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {log.ip && (
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="size-4 text-primary" />
                  <p className="text-muted-foreground text-xs">{t('admin.audit.ipAddress')}</p>
                </div>
                <p className="text-sm font-semibold font-mono ml-6">{log.ip}</p>
              </div>
            )}
            {log.ua && (
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="size-4 text-primary" />
                  <p className="text-muted-foreground text-xs">{t('admin.audit.userAgent')}</p>
                </div>
                <p className="text-xs font-medium ml-6 break-words">{log.ua}</p>
              </div>
            )}
          </div>

          <div
            className="rounded-lg border bg-muted/30 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250 fill-mode-backwards"
          >
            <p className="text-muted-foreground text-xs mb-0.5">{t('admin.audit.created')}</p>
            <p className="text-sm font-semibold">
              {log.createdAt ? formatDateTimeLong(String(log.createdAt), locale) : '—'}
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('admin.audit.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
