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
import { LoadingState, ErrorState } from '@/components/common/States';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('promotionsPage.title')}
        subtitle={t('promotionsPage.subtitle')}
        actions={
          <Button onClick={openCreate} className="gap-2 bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600">
            <Plus className="size-4" />
            {t('promotionsPage.create')}
          </Button>
        }
      />

      {promotions.length === 0 ? (
        <Alert className="rounded-xl border-2 border-dashed">
          <Tag className="size-5" />
          <AlertDescription>
            <p className="font-medium">{t('promotionsPage.noPromotions')}</p>
            <p className="mt-1 text-sm opacity-90">{t('promotionsPage.noPromotionsHint')}</p>
            <Button onClick={openCreate} variant="outline" size="sm" className="mt-3 gap-2 border-rose-500/50 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50">
              <Plus className="size-4" />
              {t('promotionsPage.create')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {promotions.map((p) => {
            const status = statusInfo(p);
            return (
              <Card key={p.id} className="overflow-hidden border-border dark:border-white/[0.08] transition-all hover:shadow-md">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                        <Badge className="shrink-0 gap-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0">
                          <Flame className="size-3" />
                          -{p.discount}%
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {t('promotionsPage.serviceLabel')}: <span className="font-medium text-foreground">{p.serviceTitle?.trim() ? p.serviceTitle : t('promotionsPage.allServices')}</span>
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDateShort(p.validFrom, locale)} – {formatDateShort(p.validUntil, locale)}
                        </span>
                        <Badge variant={status.type === 'destructive' ? 'destructive' : status.type === 'secondary' ? 'secondary' : 'default'} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="outline" size="icon" className="size-9" onClick={() => openEdit(p)} aria-label={t('promotionsPage.edit')}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="size-9 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteId(p.id)} aria-label={t('common.delete')}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[32rem] overflow-hidden rounded-[1.5rem] border-0 bg-card p-0 shadow-2xl">
          <div className="relative border-b border-black/5 px-8 pb-5 pt-7 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
                <div className="h-6 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-rose-500 to-orange-500"></div>
                {editingId ? t('promotionsPage.edit') : t('promotionsPage.create')}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="max-h-[65vh] overflow-y-auto px-8 py-6 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="promo-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('promotionsPage.titleLabel')} *</Label>
                <Input
                  id="promo-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t('promotionsPage.titlePlaceholder')}
                  className="h-11 rounded-2xl bg-slate-50/80 border-transparent px-4 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-rose-500 hover:bg-slate-100 dark:bg-white/[0.04] dark:focus-visible:bg-slate-900 dark:hover:bg-white/[0.08]"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="promo-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('promotionsPage.descriptionLabel')}</Label>
                <Textarea
                  id="promo-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t('promotionsPage.descriptionPlaceholder')}
                  rows={3}
                  className="rounded-2xl bg-slate-50/80 border-transparent p-4 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-rose-500 hover:bg-slate-100 dark:bg-white/[0.04] dark:focus-visible:bg-slate-900 dark:hover:bg-white/[0.08] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-discount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('promotionsPage.discountLabel')} *</Label>
                <Input
                  id="promo-discount"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) || 0 }))}
                  className="h-11 rounded-2xl bg-slate-50/80 border-transparent px-4 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-rose-500 hover:bg-slate-100 dark:bg-white/[0.04] dark:focus-visible:bg-slate-900 dark:hover:bg-white/[0.08]"
                />
                <p className="pl-1 text-[11px] text-muted-foreground/70">{t('promotionsPage.discountHint')}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('promotionsPage.serviceLabel')}</Label>
                <Select
                  value={form.serviceTitle || '__all__'}
                  onValueChange={(v) => setForm((f) => ({ ...f, serviceTitle: v === '__all__' ? '' : v }))}
                >
                  <SelectTrigger id="promo-service" className="h-11 rounded-2xl bg-slate-50/80 border-transparent px-4 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-rose-500 hover:bg-slate-100 dark:bg-white/[0.04] dark:focus-visible:bg-slate-900 dark:hover:bg-white/[0.08]">
                    <SelectValue placeholder={t('promotionsPage.allServices')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl dark:bg-slate-800">
                    <SelectItem value="__all__" className="rounded-xl cursor-pointer py-2 focus:bg-rose-50 dark:focus:bg-white/10" disabled={!canApplyToAll}>
                      {t('promotionsPage.allServices')}
                      {!canApplyToAll && serviceTitles.length > 0 ? ` (${t('promotionsPage.allServicesDisabled')})` : ''}
                    </SelectItem>
                    {serviceTitles.map((st) => (
                      <SelectItem key={st} value={st} className="rounded-xl cursor-pointer py-2 focus:bg-rose-50 dark:focus:bg-white/10" disabled={takenServiceTitles.has(st)}>
                        <div className="truncate pr-2">{st}</div>
                        {takenServiceTitles.has(st) ? <span className="text-[10px] text-rose-500"> {t('promotionsPage.alreadyHasPromotion')}</span> : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!form.serviceTitle && !canApplyToAll && serviceTitles.length > 0 && (
                  <p className="pl-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    {t('promotionsPage.allServicesAlreadyHavePromotion')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-from" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('promotionsPage.validFromLabel')} *</Label>
                <Input
                  id="promo-from"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                  className="h-11 w-full block rounded-2xl bg-slate-50/80 border-transparent px-4 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-rose-500 hover:bg-slate-100 dark:bg-white/[0.04] dark:focus-visible:bg-slate-900 dark:hover:bg-white/[0.08]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-until" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('promotionsPage.validUntilLabel')} *</Label>
                <Input
                  id="promo-until"
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                  className="h-11 w-full block rounded-2xl bg-slate-50/80 border-transparent px-4 shadow-sm transition-all focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-rose-500 hover:bg-slate-100 dark:bg-white/[0.04] dark:focus-visible:bg-slate-900 dark:hover:bg-white/[0.08]"
                />
              </div>
              <div className="sm:col-span-2 mt-1 flex items-center justify-between rounded-2xl border border-transparent bg-slate-50/80 px-5 py-4 shadow-sm transition-all dark:border-white/[0.02] dark:bg-white/[0.04]">
                <Label htmlFor="promo-active" className="cursor-pointer text-sm font-bold text-foreground">{t('promotionsPage.isActiveLabel')}</Label>
                <Switch id="promo-active" checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} className="shadow-sm" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-black/5 bg-slate-50/50 px-8 py-5 dark:border-white/5 dark:bg-slate-900/50 sm:justify-between flex-col-reverse sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={createLoading || updateLoading} className="w-full sm:w-auto rounded-2xl font-medium">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createLoading ||
                updateLoading ||
                !form.title.trim() ||
                !form.validFrom ||
                !form.validUntil ||
                (!form.serviceTitle?.trim() && !canApplyToAll)
              }
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-8 text-white shadow-md hover:from-rose-600 hover:to-orange-600 dark:from-rose-600 dark:to-orange-600"
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
