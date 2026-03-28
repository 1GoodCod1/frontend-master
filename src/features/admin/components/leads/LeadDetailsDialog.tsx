import { useTranslation } from 'react-i18next';
import {
  Star,
  User,
  Phone,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { mediaUrl } from '@/utils/media';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';
import { useLeadsByIdQuery, useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LEAD_STATUS_OPTIONS, type LeadStatus } from '@/types/leads';
import { isRecord } from '@/utils/guards';
import type { LeadDto } from '@/types/leads';

interface RequestDetailsDialogProps {
  open: boolean;
  lead: LeadDto | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

function pickStr(obj: unknown, ...keys: string[]): string {
  if (!isRecord(obj)) return '';
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

function pickDate(obj: unknown, key: string): string | null {
  if (!isRecord(obj)) return null;
  const v = obj[key];
  return typeof v === 'string' || typeof v === 'number' ? String(v) : null;
}

export default function RequestDetailsDialog({
  open,
  lead,
  onClose,
  onStatusUpdated,
}: RequestDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const leadId = lead?.id ? String(lead.id) : '';

  const { data: fullLeadData, isLoading } = useLeadsByIdQuery(
    { id: leadId },
    { skip: !open || !leadId },
  );
  const [updateStatus, { isLoading: isUpdating }] = useLeadsUpdateStatusMutation();

  const displayLead = (fullLeadData ?? lead) as LeadDto & Record<string, unknown>;

  if (!lead) return null;

  const clientName = pickStr(displayLead, 'clientName', 'name');
  const clientPhone = pickStr(displayLead, 'clientPhone', 'phone');

  const master = displayLead?.master;
  const masterName = master
    ? `${master.user?.firstName ?? ''} ${master.user?.lastName ?? ''}`.trim() || '—'
    : null;
  const avatarUrl = mediaUrl(
    master?.avatarUrl || master?.avatarFile?.path || null,
  );
  const avatarFallback = (master?.user?.firstName?.[0] ?? 'M').toUpperCase();

  // Collect client-attached files/photos
  const rawFiles = Array.isArray(displayLead?.files) ? displayLead.files : [];
  const files = rawFiles.map((x: unknown) => {
    const item = isRecord(x) ? x : {};
    // Support both nested { file: {...} } and flat { path, mimetype, ... }
    const f = (isRecord(item.file) ? item.file : item) as Record<string, unknown>;
    const path = typeof f.path === 'string' ? f.path : typeof item.path === 'string' ? item.path : '';
    const mimetype = typeof f.mimetype === 'string' ? f.mimetype : '';
    const filename = typeof f.filename === 'string' ? f.filename : typeof f.originalName === 'string' ? f.originalName : '';
    const id = typeof f.id === 'string' ? f.id : typeof item.id === 'string' ? String(item.id) : path;
    const isImage = mimetype.startsWith('image/')
      || /\.(png|jpe?g|webp|gif|avif)$/i.test(path);
    return { id, path, filename, isImage, url: mediaUrl(path) };
  }).filter((f) => f.path);

  const handleStatusChange = async (next: LeadStatus) => {
    if (!leadId) return;
    try {
      await updateStatus({ id: leadId, body: { status: next } }).unwrap();
      onStatusUpdated?.();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'data' in e
          ? (e as { data?: { message?: string } }).data?.message
          : null;
      toast.error((msg as string) || (e instanceof Error ? e.message : t('leads.updateStatusFailed')));
    }
  };

  const updatedAt = pickDate(displayLead, 'updatedAt');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md sm:max-w-lg md:max-w-2xl"
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <MessageSquare className="size-4" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              {t('leads.leadDetailsTitle', { id: String(leadId) })}
              {displayLead?.isPremium && (
                <Badge className="bg-amber-600 hover:bg-amber-600 text-white gap-1 shrink-0">
                  <Star className="size-3.5" />
                  {t('leads.premiumBadge')}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-10 animate-spin text-amber-600" />
            </div>
          ) : (
            <>
              {/* Status row */}
              <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75 fill-mode-backwards">
                <StatusChip kind="lead" value={String(displayLead?.status ?? '')} />
                {leadId && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t('leads.status')}:</span>
                    <Select
                      value={(displayLead?.status as string) ?? 'NEW'}
                      onValueChange={(v) => handleStatusChange(v as LeadStatus)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue placeholder={t('leads.setStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`leads.${s.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Client info */}
              <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-backwards">
                <p className="text-sm font-semibold text-foreground mb-3">
                  {t('leads.client')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">{t('leads.nameLabel')}</p>
                      <p className="font-medium">{clientName || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">{t('leads.phoneLabel')}</p>
                      <p className="font-medium">{clientPhone || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Master info */}
              {master && (
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-backwards">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    {t('admin.leads.master')}
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-14 rounded-lg border-2 border-slate-200 dark:border-white/[0.08] bg-amber-600 text-lg font-semibold">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="text-white bg-amber-600">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{masterName}</p>
                      {master?.category && (
                        <p className="text-sm text-muted-foreground truncate">
                          {getTranslatedCategoryName(t, master.category)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {displayLead?.message && (
                <div className="min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.03] p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-sm font-semibold text-foreground">
                      {t('leads.message')}
                    </p>
                  </div>
                  <p className="min-w-0 max-w-full text-sm text-muted-foreground whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                    {String(displayLead.message)}
                  </p>
                </div>
              )}

              {/* Client attachments (photos / files) */}
              {files.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="size-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-semibold text-foreground">
                      {t('leads.files')} ({files.length})
                    </p>
                  </div>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                    {files.map((f) =>
                      f.isImage ? (
                        <button
                          key={f.id}
                          type="button"
                          className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-white/[0.08] aspect-square cursor-pointer transition hover:border-amber-500/60 hover:shadow-md p-0 bg-transparent"
                          onClick={() => window.open(f.url, '_blank')}
                        >
                          <img
                            src={f.url}
                            alt={f.filename || 'photo'}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                          />
                        </button>
                      ) : (
                        <button
                          key={f.id}
                          type="button"
                          className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] aspect-square bg-muted/40 hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => window.open(f.url, '_blank')}
                        >
                          <ExternalLink className="size-6 text-amber-600 dark:text-amber-400" />
                          <span className="max-w-[90%] truncate text-[11px] text-muted-foreground px-1">
                            {f.filename || 'file'}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250 fill-mode-backwards">
                  <p className="text-muted-foreground text-xs mb-0.5">{t('common.created')}</p>
                  <p className="text-sm font-semibold">
                    {displayLead?.createdAt
                      ? formatDateTimeLong(displayLead.createdAt as string, locale)
                      : '—'}
                  </p>
                </div>
                {updatedAt && (
                  <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250 fill-mode-backwards">
                    <p className="text-muted-foreground text-xs mb-0.5">{t('common.updated')}</p>
                    <p className="text-sm font-semibold">
                      {formatDateTimeLong(updatedAt, locale)}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="border-0 bg-amber-50 text-amber-700 shadow-sm transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
          >
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
