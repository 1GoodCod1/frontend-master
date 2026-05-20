import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNow } from '@/hooks/useNow';
import { Tag, Plus, Pencil, Trash2, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/hooks';
import { selectIsVerified } from '@/features/auth/selectors';
import {
  usePromotionsMyQuery,
  usePromotionsCreateMutation,
  usePromotionsUpdateMutation,
  usePromotionsDeleteMutation,
} from '@/features/promotions/promotionsApi';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
import { VerificationGate } from '@/components/common/VerificationGate';
import type { PromotionDto } from '@/types';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils';
import {
  masterBadgeCls,
  masterCardCls,
  masterDialogContentCls,
  masterFormLabelCls,
  masterIconWrapCls,
  masterInputCls,
  masterInsetPanelCls,
  masterOutlineBtnCls,
  masterPageClassName,
  masterPrimaryBtnCls,
  masterSectionTitleCls,
  masterSelectTriggerCls,
  masterTextareaCls,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';
import { CabinetEmptyState } from '@/components/cabinet/CabinetEmptyState';
import { LoadingState, ErrorState } from '@/components/common/States';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const defaultForm = {
  title: '',
  description: '',
  discount: 10,
  serviceTitle: '' as string,
  validFrom: '',
  validUntil: '',
  isActive: true,
};

function toDateInputValue(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function PromotionsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const isVerified = useAppSelector(selectIsVerified);
  const now = useNow();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: list, isLoading, error, refetch: refetchPromotions } = usePromotionsMyQuery(undefined, {
    skip: !isVerified,
  });
  const { data: profile } = useMastersMyProfileQuery(undefined, {
    skip: !isVerified,
  });
  const [create, { isLoading: createLoading }] = usePromotionsCreateMutation();
  const [update, { isLoading: updateLoading }] = usePromotionsUpdateMutation();
  const [remove, { isLoading: deleteLoading }] = usePromotionsDeleteMutation();

  const promotions: PromotionDto[] = useMemo(() => {
    if (Array.isArray(list)) return list;
    if (list && typeof list === 'object' && 'data' in list && Array.isArray((list as { data: PromotionDto[] }).data)) {
      return (list as { data: PromotionDto[] }).data;
    }
    return [];
  }, [list]);

  const serviceTitles: string[] = useMemo(() => {
    const a = profile as { services?: unknown[]; data?: { services?: unknown[]; data?: { services?: unknown[] } } } | undefined;
    const candidates = [a?.services, a?.data?.services, a?.data?.data?.services];
    const s = candidates.find(Array.isArray) as { priceType?: string; title?: string }[] | undefined;
    if (!s) return [];
    return s
      .filter((item) => item?.priceType === 'FIXED' && typeof item?.title === 'string' && item.title.trim())
      .map((item) => (item.title as string).trim());
  }, [profile]);

  /** Услуги, на которые уже действует отдельная акция (конкретная услуга). Акция «на все» не занимает услуги — она только на те, у кого нет своей акции. При редактировании — исключаем текущую акцию. */
  const takenServiceTitles = useMemo(() => {
    const set = new Set<string>();
    for (const p of promotions) {
      if (!p.isActive || !p.serviceTitle?.trim()) continue;
      const from = new Date(p.validFrom).getTime();
      const to = new Date(p.validUntil).getTime();
      if (from > now || to < now) continue;
      if (editingId && p.id === editingId) continue;
      set.add(p.serviceTitle.trim());
    }
    return set;
  }, [promotions, editingId, now]);

  /** Есть ли активная акция «на все» (кроме текущей при редактировании). */
  const hasActiveAllServicesPromo = useMemo(() => {
    return promotions.some((p) => {
      if (!p.isActive || p.serviceTitle?.trim()) return false;
      const from = new Date(p.validFrom).getTime();
      const to = new Date(p.validUntil).getTime();
      if (from > now || to < now) return false;
      if (editingId && p.id === editingId) return false;
      return true;
    });
  }, [promotions, editingId, now]);

  /** «На все» можно выбрать только если есть хотя бы одна услуга без акции и ещё нет активной акции «на все». */
  const canApplyToAll = useMemo(() => {
    if (serviceTitles.length === 0 || hasActiveAllServicesPromo) return false;
    const withoutPromotion = serviceTitles.filter((st) => !takenServiceTitles.has(st));
    return withoutPromotion.length > 0;
  }, [serviceTitles, takenServiceTitles, hasActiveAllServicesPromo]);

  const openCreate = () => {
    setEditingId(null);
    const today = new Date();
    const from = today.toISOString().slice(0, 10);
    const until = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setForm({
      ...defaultForm,
      validFrom: from,
      validUntil: until,
    });
    setDialogOpen(true);
  };

  const openEdit = (p: PromotionDto) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      discount: p.discount,
      serviceTitle: p.serviceTitle ?? '',
      validFrom: toDateInputValue(p.validFrom),
      validUntil: toDateInputValue(p.validUntil),
      isActive: p.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const { title, description, discount, serviceTitle, validFrom, validUntil, isActive } = form;
    if (!title.trim() || !validFrom || !validUntil) {
      toast.error(t('common.pleaseFillRequired', 'Please fill required fields'));
      return;
    }
    const d = Number(discount);
    if (!Number.isFinite(d) || d < 1 || d > 100) {
      toast.error(t('promotionsPage.discountHint'));
      return;
    }
    if (new Date(validUntil) < new Date(validFrom)) {
      toast.error(t('promotionsPage.validUntilLabel') + ' must be after ' + t('promotionsPage.validFromLabel'));
      return;
    }
    const serviceTitleTrimmed = serviceTitle?.trim() || null;
    if (serviceTitleTrimmed && takenServiceTitles.has(serviceTitleTrimmed)) {
      toast.error(t('promotionsPage.serviceAlreadyHasPromotion'));
      return;
    }
    if (!serviceTitleTrimmed && !canApplyToAll) {
      toast.error(t('promotionsPage.allServicesAlreadyHavePromotion'));
      return;
    }
    const body = {
      title: title.trim(),
      description: description.trim(),
      discount: Math.round(d),
      serviceTitle: serviceTitleTrimmed ?? '',
      validFrom,
      validUntil,
      isActive,
    };
    try {
      if (editingId) {
        await update({ id: editingId, body }).unwrap();
        toast.success(t('promotionsPage.updated'));
      } else {
        await create(body).unwrap();
        toast.success(t('promotionsPage.created'));
      }
      setDialogOpen(false);
      await refetchPromotions();
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || (editingId ? t('promotionsPage.updateFailed') : t('promotionsPage.createFailed')));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id).unwrap();
      toast.success(t('promotionsPage.deleted'));
      setDeleteId(null);
      await refetchPromotions();
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || t('promotionsPage.deleteFailed'));
    }
  };

  const statusInfo = (p: PromotionDto) => {
    const until = new Date(p.validUntil).getTime();
    if (!p.isActive) return { label: t('promotionsPage.inactive'), type: 'secondary' as const };
    if (until < now) return { label: t('promotionsPage.expired'), type: 'destructive' as const };
    const days = Math.ceil((until - now) / (24 * 60 * 60 * 1000));
    if (days <= 1) return { label: t('promotionsPage.lastDay'), type: 'warning' as const };
    return { label: t('promotionsPage.daysLeft', { count: days }), type: 'default' as const };
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => refetchPromotions()} />;

  return (
    <VerificationGate isVerified={isVerified}>
    <div className={masterPageClassName}>
      <PageHeader
        title={t('promotionsPage.title')}
        actions={
          <Button type="button" onClick={openCreate} className={cn(masterPrimaryBtnCls, 'gap-2')}>
            <Plus className="size-4" />
            {t('promotionsPage.create')}
          </Button>
        }
      />

      {promotions.length === 0 ? (
        <CabinetEmptyState
          icon={Tag}
          title={t('promotionsPage.noPromotions')}
          description={t('promotionsPage.noPromotionsHint')}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {promotions.map((p) => {
            const status = statusInfo(p);
            return (
              <div key={p.id} className={masterCardCls}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={cn('truncate font-semibold', masterSectionTitleCls)}>{p.title}</h3>
                        <span className={cn(masterBadgeCls, 'gap-1 normal-case bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12')}>
                          <Flame className="size-3" />
                          -{p.discount}%
                        </span>
                      </div>
                      {p.description ? (
                        <p className={cn('mt-1 line-clamp-2', masterTextMuted)}>{p.description}</p>
                      ) : null}
                      <p className={cn('mt-1.5', masterTextMuted)}>
                        {t('promotionsPage.serviceLabel')}:{' '}
                        <span className="font-medium text-[#212529] dark:text-white">
                          {p.serviceTitle?.trim() ? p.serviceTitle : t('promotionsPage.allServices')}
                        </span>
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={masterTextMuted}>
                          {formatDateShort(p.validFrom, locale)} – {formatDateShort(p.validUntil, locale)}
                        </span>
                        <Badge
                          variant={
                            status.type === 'destructive'
                              ? 'destructive'
                              : status.type === 'secondary'
                                ? 'secondary'
                                : 'default'
                          }
                          className="text-xs"
                        >
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(masterOutlineBtnCls, 'size-9 shrink-0 p-0')}
                        onClick={() => openEdit(p)}
                        aria-label={t('promotionsPage.edit')}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-9 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(p.id)}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(masterDialogContentCls, 'flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-1.5rem)] max-w-lg flex-col overflow-hidden p-0 sm:w-full')}>
          <DialogHeader className="border-b border-[#e8e8e8] px-6 py-5 text-left dark:border-[#2d2d2d]">
            <DialogTitle className="flex items-center gap-3">
              <span className={masterIconWrapCls}>
                <Tag className="size-5" />
              </span>
              <span className={masterSectionTitleCls}>
                {editingId ? t('promotionsPage.edit') : t('promotionsPage.create')}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="promo-title" className={masterFormLabelCls}>{t('promotionsPage.titleLabel')} *</Label>
                <Input
                  id="promo-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t('promotionsPage.titlePlaceholder')}
                  className={masterInputCls}
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="promo-desc" className={masterFormLabelCls}>{t('promotionsPage.descriptionLabel')}</Label>
                <Textarea
                  id="promo-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t('promotionsPage.descriptionPlaceholder')}
                  rows={3}
                  className={cn(masterTextareaCls, 'p-4')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-discount" className={masterFormLabelCls}>{t('promotionsPage.discountLabel')} *</Label>
                <Input
                  id="promo-discount"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) || 0 }))}
                  className={masterInputCls}
                />
                <p className={masterTextMuted}>{t('promotionsPage.discountHint')}</p>
              </div>
              <div className="space-y-2">
                <Label className={masterFormLabelCls}>{t('promotionsPage.serviceLabel')}</Label>
                <Select
                  value={form.serviceTitle || '__all__'}
                  onValueChange={(v) => setForm((f) => ({ ...f, serviceTitle: v === '__all__' ? '' : v }))}
                >
                  <SelectTrigger id="promo-service" className={masterSelectTriggerCls}>
                    <SelectValue placeholder={t('promotionsPage.allServices')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__" disabled={!canApplyToAll}>
                      {t('promotionsPage.allServices')}
                      {!canApplyToAll && serviceTitles.length > 0 ? ` (${t('promotionsPage.allServicesDisabled')})` : ''}
                    </SelectItem>
                    {serviceTitles.map((st) => (
                      <SelectItem key={st} value={st} disabled={takenServiceTitles.has(st)}>
                        <div className="truncate pr-2">{st}</div>
                        {takenServiceTitles.has(st) ? (
                          <span className="text-[10px] text-[#E97525]"> {t('promotionsPage.alreadyHasPromotion')}</span>
                        ) : null}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!form.serviceTitle && !canApplyToAll && serviceTitles.length > 0 && (
                  <p className="pl-1 text-[10px] font-medium text-[#E97525] dark:text-[#f08540]">
                    {t('promotionsPage.allServicesAlreadyHavePromotion')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-from" className={masterFormLabelCls}>{t('promotionsPage.validFromLabel')} *</Label>
                <Input
                  id="promo-from"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                  className={masterInputCls}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-until" className={masterFormLabelCls}>{t('promotionsPage.validUntilLabel')} *</Label>
                <Input
                  id="promo-until"
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                  className={masterInputCls}
                />
              </div>
              <div className={cn(masterInsetPanelCls, 'sm:col-span-2 flex items-center justify-between')}>
                <Label htmlFor="promo-active" className={cn('cursor-pointer', masterFormLabelCls)}>
                  {t('promotionsPage.isActiveLabel')}
                </Label>
                <Switch
                  id="promo-active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-3 border-t border-[#e8e8e8] px-6 py-4 dark:border-[#2d2d2d] sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createLoading || updateLoading}
              className={cn(masterOutlineBtnCls, 'w-full sm:w-auto')}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                createLoading ||
                updateLoading ||
                !form.title.trim() ||
                !form.validFrom ||
                !form.validUntil ||
                (!form.serviceTitle?.trim() && !canApplyToAll)
              }
              className={cn(masterPrimaryBtnCls, 'w-full sm:w-auto')}
            >
              {createLoading || updateLoading ? t('common.loading') : editingId ? t('common.save') : t('promotionsPage.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteId && (
        <ConfirmDialog
          open
          onClose={() => setDeleteId(null)}
          onConfirm={async () => handleDelete(deleteId)}
          title={t('promotionsPage.deleteConfirm')}
          description={t('promotionsPage.deleteMessage')}
          confirmText={t('common.delete')}
          confirmColor="error"
          isLoading={deleteLoading}
        />
      )}
    </div>
    </VerificationGate>
  );
}
