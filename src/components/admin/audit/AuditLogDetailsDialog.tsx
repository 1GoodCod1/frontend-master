import { useTranslation } from 'react-i18next';
import { Shield, User, FileText, MapPin, Monitor } from 'lucide-react';
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
  const { i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);

  if (!log) return null;

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
            Audit Log Details
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div
            className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75 fill-mode-backwards"
          >
            <Badge variant="secondary" className="font-semibold px-3 py-1">
              {log.action || 'UNKNOWN'}
            </Badge>
            <Badge variant="outline" className="font-semibold px-3 py-1 border-primary/50 text-primary">
              {log.entity || 'UNKNOWN'}
            </Badge>
          </div>

          {log.actorId && (
            <div
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-backwards"
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="size-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">Actor</p>
              </div>
              <p className="text-sm font-mono ml-7">{log.actorId}</p>
            </div>
          )}

          {log.entityId && (
            <div
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-backwards"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">Entity ID</p>
              </div>
              <p className="text-sm font-mono ml-7">{log.entityId}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {log.ip && (
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="size-4 text-primary" />
                  <p className="text-muted-foreground text-xs">IP Address</p>
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
                  <p className="text-muted-foreground text-xs">User Agent</p>
                </div>
                <p className="text-xs font-medium ml-6 break-words">{log.ua}</p>
              </div>
            )}
          </div>

          <div
            className="rounded-lg border bg-muted/30 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250 fill-mode-backwards"
          >
            <p className="text-muted-foreground text-xs mb-0.5">Created At</p>
            <p className="text-sm font-semibold">
              {log.createdAt ? formatDateTimeLong(String(log.createdAt), locale) : '—'}
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
