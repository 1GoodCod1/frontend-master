import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Plus, Pencil, Trash2, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  usePromotionsMyQuery,
  usePromotionsCreateMutation,
  usePromotionsUpdateMutation,
  usePromotionsDeleteMutation,
} from '@/features/promotions/promotionsApi';
import { useMastersMyProfileQuery } from '@/features/masters/mastersApi';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: list, isLoading, error, refetch: refetchPromotions } = usePromotionsMyQuery();
  const { data: profile } = useMastersMyProfileQuery();
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
    const a: any = profile;
    const candidates = [a?.services, a?.data?.services, a?.data?.data?.services];
    const s = candidates.find(Array.isArray);
    if (!s) return [];
    return s
      .filter((item: any) => item?.priceType === 'FIXED' && typeof item?.title === 'string' && item.title.trim())
      .map((item: any) => item.title.trim());
  }, [profile]);

  /** Услуги, на которые уже действует отдельная акция (конкретная услуга). Акция «на все» не занимает услуги — она только на те, у кого нет своей акции. При редактировании — исключаем текущую акцию. */
  const takenServiceTitles = useMemo(() => {
    const now = Date.now();
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
  }, [promotions, editingId]);

  /** Есть ли активная акция «на все» (кроме текущей при редактировании). */
  const hasActiveAllServicesPromo = useMemo(() => {
    const now = Date.now();
    return promotions.some((p) => {
      if (!p.isActive || p.serviceTitle?.trim()) return false;
      const from = new Date(p.validFrom).getTime();
      const to = new Date(p.validUntil).getTime();
      if (from > now || to < now) return false;
      if (editingId && p.id === editingId) return false;
      return true;
    });
  }, [promotions, editingId]);

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
    const now = Date.now();
    const until = new Date(p.validUntil).getTime();
    if (!p.isActive) return { label: t('promotionsPage.inactive'), type: 'secondary' as const };
    if (until < now) return { label: t('promotionsPage.expired'), type: 'destructive' as const };
    const days = Math.ceil((until - now) / (24 * 60 * 60 * 1000));
    if (days <= 1) return { label: t('promotionsPage.lastDay'), type: 'warning' as const };
    return { label: t('promotionsPage.daysLeft', { count: days }), type: 'default' as const };
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={() => {}} />;

  return (
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
        <DialogContent className="sm:max-w-[28rem] rounded-2xl border-border bg-card shadow-xl dark:shadow-2xl dark:shadow-black/40 p-0 gap-0 overflow-hidden">
          <div className="bg-gradient-to-br from-rose-500/10 via-transparent to-orange-500/10 dark:from-rose-500/15 dark:to-orange-500/15 border-b border-border px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {editingId ? t('promotionsPage.edit') : t('promotionsPage.create')}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="promo-title" className="text-foreground font-medium">{t('promotionsPage.titleLabel')} *</Label>
                <Input
                  id="promo-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t('promotionsPage.titlePlaceholder')}
                  className="rounded-xl bg-background border-border focus-visible:ring-rose-500/50 dark:focus-visible:ring-rose-400/50"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="promo-desc" className="text-foreground font-medium">{t('promotionsPage.descriptionLabel')}</Label>
                <Textarea
                  id="promo-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t('promotionsPage.descriptionPlaceholder')}
                  rows={3}
                  className="rounded-xl bg-background border-border resize-none focus-visible:ring-rose-500/50 dark:focus-visible:ring-rose-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-discount" className="text-foreground font-medium">{t('promotionsPage.discountLabel')} *</Label>
                <Input
                  id="promo-discount"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) || 0 }))}
                  className="rounded-xl bg-background border-border focus-visible:ring-rose-500/50 dark:focus-visible:ring-rose-400/50"
                />
                <p className="text-xs text-muted-foreground">{t('promotionsPage.discountHint')}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">{t('promotionsPage.serviceLabel')}</Label>
                <Select
                  value={form.serviceTitle || '__all__'}
                  onValueChange={(v) => setForm((f) => ({ ...f, serviceTitle: v === '__all__' ? '' : v }))}
                >
                  <SelectTrigger id="promo-service" className="rounded-xl bg-background border-border">
                    <SelectValue placeholder={t('promotionsPage.allServices')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="__all__" className="rounded-lg" disabled={!canApplyToAll}>
                      {t('promotionsPage.allServices')}
                      {!canApplyToAll && serviceTitles.length > 0 ? ` (${t('promotionsPage.allServicesDisabled')})` : ''}
                    </SelectItem>
                    {serviceTitles.map((st) => (
                      <SelectItem key={st} value={st} className="rounded-lg" disabled={takenServiceTitles.has(st)}>
                        {st}
                        {takenServiceTitles.has(st) ? ` (${t('promotionsPage.alreadyHasPromotion')})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('promotionsPage.serviceAlreadyHasPromotionHint')} {t('promotionsPage.onlyFixedPriceServices')}
                </p>
                {!form.serviceTitle && !canApplyToAll && serviceTitles.length > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    {t('promotionsPage.allServicesAlreadyHavePromotion')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-from" className="text-foreground font-medium">{t('promotionsPage.validFromLabel')} *</Label>
                <Input
                  id="promo-from"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                  className="rounded-xl bg-background border-border focus-visible:ring-rose-500/50 dark:focus-visible:ring-rose-400/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-until" className="text-foreground font-medium">{t('promotionsPage.validUntilLabel')} *</Label>
                <Input
                  id="promo-until"
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                  className="rounded-xl bg-background border-border focus-visible:ring-rose-500/50 dark:focus-visible:ring-rose-400/50"
                />
              </div>
              <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-muted/50 dark:bg-muted/30 border border-border px-4 py-3">
                <Label htmlFor="promo-active" className="cursor-pointer text-foreground font-medium">{t('promotionsPage.isActiveLabel')}</Label>
                <Switch id="promo-active" checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 dark:bg-muted/20 gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createLoading || updateLoading} className="rounded-xl min-w-[5rem]">
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
              className="rounded-xl min-w-[5rem] bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-500"
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
  );
}
