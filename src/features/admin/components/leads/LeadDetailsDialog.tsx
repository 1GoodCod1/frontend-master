import { useTranslation } from 'react-i18next';
import {
  Star,
  User,
  Phone,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Copy,
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
import { useLeadsByIdQuery } from '@/features/leads/leadsApi';
import { useLeadsUpdateStatusMutation } from '@/features/leads/leadsApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LEAD_STATUS_OPTIONS, type LeadStatus } from '@/types/leads';
import { Card } from '@/components/ui/card';
import type { LeadDto } from '@/types/leads';
import { isRecord } from '@/utils/guards';

function pickDateLikeField(obj: unknown, key: string): string | number | undefined {
  if (!isRecord(obj)) return undefined;
  const v = obj[key];
  return typeof v === 'string' || typeof v === 'number' ? v : undefined;
}

interface RequestDetailsDialogProps {
  open: boolean;
  lead: LeadDto | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
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

  const displayLead = fullLeadData ?? lead;

  if (!lead) return null;

  const files = Array.isArray(displayLead?.files) ? displayLead.files : [];
  const avatarPath = displayLead?.master?.avatarFile?.path ?? undefined;
  const avatarUrl = avatarPath
    ? mediaUrl(avatarPath)
    : displayLead?.master?.avatarUrl;

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
                  Premium
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

              <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-backwards">
                <p className="text-sm font-semibold text-foreground mb-3">
                  {t('leads.client')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Name</p>
                      <p className="font-medium">
                        displayLead?.clientName ||
                        pickStringField(displayLead, 'name') ||
                        '—'
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs">Phone</p>
                      <p className="font-medium">
                        displayLead?.clientPhone ||
                        pickStringField(displayLead, 'phone') ||
                        '—'
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {displayLead?.master && (
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-backwards">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    {t('admin.leads.master')}
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-14 rounded-lg border-2 border-slate-200 dark:border-white/[0.08] bg-amber-600 text-lg font-semibold">
                      <AvatarImage src={avatarUrl ?? undefined} className="object-cover" />
                      <AvatarFallback className="text-white">
                        {String(displayLead.master?.user?.firstName?.[0] ?? 'M').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {`${displayLead.master?.user?.firstName || ''} ${displayLead.master?.user?.lastName || ''}`.trim() || '—'}
                      </p>
                      {displayLead.master?.category && (
                        <p className="text-sm text-muted-foreground truncate">
                          {getTranslatedCategoryName(t, displayLead.master.category)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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

              {files.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="size-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-semibold text-foreground">
                      {t('leads.files')} ({files.length})
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {files.map((x: unknown) => {
                      const item = x as { file?: Record<string, unknown>; id?: string };
                      const f = item?.file ?? item;
                      const file = f as {
                        path?: string;
                        mimetype?: string;
                        filename?: string;
                        size?: number;
                        id?: string;
                      };
                      const url = mediaUrl(file?.path);
                      const isImage =
                        typeof file?.mimetype === 'string'
                          ? file.mimetype.startsWith('image/')
                          : /\.(png|jpe?g|webp|gif)$/i.test(String(file?.path));

                      return (
                        <Card
                          key={file?.id ?? item?.id}
                          className="overflow-hidden border border-slate-200 dark:border-white/[0.08] transition-all hover:border-amber-500/50"
                        >
                          {isImage ? (
                            <button
                              type="button"
                              className="block w-full cursor-pointer border-0 bg-transparent p-0"
                              onClick={() => window.open(url, '_blank')}
                            >
                              <img
                                src={url}
                                alt={file?.filename ?? 'file'}
                                className="h-32 w-full object-cover transition-transform hover:scale-[1.02]"
                              />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="flex h-32 w-full items-center justify-center bg-muted/50 transition-colors hover:bg-muted"
                              onClick={() => window.open(url, '_blank')}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <Paperclip className="size-8 text-muted-foreground opacity-50" />
                                <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                                  {file?.filename ?? 'Attachment'}
                                </span>
                              </div>
                            </button>
                          )}
                          <div className="space-y-2 p-2">
                            <p className="truncate text-xs font-bold" title={file?.filename}>
                              {file?.filename ?? 'Attachment'}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="h-7 gap-1 border-0 bg-amber-600 text-white text-xs hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                                onClick={() => window.open(url, '_blank')}
                              >
                                <ExternalLink className="size-3" />
                                {t('common.open')}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 gap-1 text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(url);
                                  toast.success(t('common.copied'));
                                }}
                              >
                                <Copy className="size-3" />
                                {t('common.copyLink')}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250 fill-mode-backwards">
                  <p className="text-muted-foreground text-xs mb-0.5">{t('common.created')}</p>
                  <p className="text-sm font-semibold">
                    {displayLead?.createdAt
                      ? formatDateTimeLong(displayLead.createdAt as string, locale)
                      : '—'}
                  </p>
                </div>
                {pickDateLikeField(displayLead, 'updatedAt') && (
                  <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-amber-500/5 dark:bg-amber-500/10 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250 fill-mode-backwards">
                    <p className="text-muted-foreground text-xs mb-0.5">{t('common.updated')}</p>
                    <p className="text-sm font-semibold">
                      {formatDateTimeLong(String(pickDateLikeField(displayLead, 'updatedAt')), locale)}
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
            className="border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
          >
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
