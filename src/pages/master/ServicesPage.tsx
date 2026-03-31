import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  ListChecks,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  HandCoins,
  Save,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectIsVerified } from '@/features/auth/selectors';
import { toErrorMessage } from '@/utils/errors';
import { useMastersMyProfileQuery, useMastersUpdateServicesMutation } from '@/features/masters/mastersApi';
import { usePromotionsMyQuery, usePromotionsDeleteMutation } from '@/features/promotions/promotionsApi';
import type { PromotionDto } from '@/types';
import { LoadingState, ErrorState } from '@/components/common/States';
import { VerificationGate } from '@/components/common/VerificationGate';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  ServiceForm,
  ServiceFormFields,
  type ServiceItem,
} from '@/features/services/components/ServiceForm';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MasterServiceItem } from '@/types';

function defaultService(): ServiceItem {
  return { title: '', priceType: 'NEGOTIABLE', price: '', currency: 'MDL' };
}

function normalizeServices(raw: unknown): ServiceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    title: typeof item?.title === 'string' ? item.title : '',
    priceType: item?.priceType === 'FIXED' ? 'FIXED' : 'NEGOTIABLE',
    price: item?.priceType === 'FIXED' && item?.price != null ? Number(item.price as number) : '',
    currency: item?.currency === 'EUR' || item?.currency === 'USD' ? item.currency : 'MDL',
  }));
}

export default function ServicesPage() {
  const { t } = useTranslation();
  const isVerified = useAppSelector(selectIsVerified);
  const { data, isLoading, error, refetch } = useMastersMyProfileQuery(undefined, {
    skip: !isVerified,
  });
  const [updateServices, { isLoading: saving }] = useMastersUpdateServicesMutation();

  const { data: promotionsList } = usePromotionsMyQuery(undefined, { skip: !isVerified });
  const [deletePromotion] = usePromotionsDeleteMutation();

  const promotions: PromotionDto[] = useMemo(() => {
    if (Array.isArray(promotionsList)) return promotionsList;
    if (promotionsList && typeof promotionsList === 'object' && 'data' in promotionsList && Array.isArray((promotionsList as { data: PromotionDto[] }).data)) {
      return (promotionsList as { data: PromotionDto[] }).data;
    }
    return [];
  }, [promotionsList]);

  const profileData = useMemo(() => {
    const raw = data as unknown;
    if (raw && typeof raw === 'object' && 'data' in raw) return (raw as { data?: unknown }).data;
    return raw;
  }, [data]) as { services?: ServiceItem[] } | undefined;

  const servicesList: ServiceItem[] = useMemo(
    () => normalizeServices(profileData?.services),
    [profileData?.services]
  );

  const [list, setList] = useState<ServiceItem[]>(servicesList);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pendingAdds, setPendingAdds] = useState<ServiceItem[]>([defaultService()]);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const lastSyncedServicesRef = useRef<ServiceItem[]>(servicesList);

  // Sync list from server only when server data actually changed (e.g. after refetch),
  // not when we just closed the edit form (otherwise we'd overwrite local edits).
  useEffect(() => {
    if (addModalOpen || editingIndex !== null) return;
    const serverChanged =
      servicesList.length !== lastSyncedServicesRef.current.length ||
      servicesList.some(
        (s, i) => {
          const prev = lastSyncedServicesRef.current[i];
          return !prev || s.title !== prev.title || s.priceType !== prev.priceType || s.price !== prev.price || s.currency !== prev.currency;
        }
      );
    if (serverChanged) {
      lastSyncedServicesRef.current = servicesList;
      queueMicrotask(() => setList(servicesList));
    }
  }, [servicesList, addModalOpen, editingIndex]);

  const formService = editingIndex !== null ? list[editingIndex] ?? defaultService() : null;
  const setFormService = (updater: (prev: ServiceItem) => ServiceItem) => {
    if (editingIndex !== null) {
      setList((prev) => prev.map((s, i) => (i === editingIndex ? updater(s) : s)));
    }
  };

  const openAddModal = () => {
    setEditingIndex(null);
    setPendingAdds([defaultService()]);
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setPendingAdds([defaultService()]);
  };

  const updatePendingRow = (index: number, updater: (prev: ServiceItem) => ServiceItem) => {
    setPendingAdds((prev) => prev.map((s, i) => (i === index ? updater(s) : s)));
  };

  const addAnotherRow = () => {
    setPendingAdds((prev) => [...prev, defaultService()]);
  };

  const removePendingRow = (index: number) => {
    setPendingAdds((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const saveBulkAdds = async () => {
    const filled = pendingAdds.filter((s) => s.title.trim());
    if (filled.length === 0) {
      toast.error(t('servicesPage.atLeastOneService'));
      return;
    }
    for (const s of filled) {
      if (s.priceType === 'FIXED' && (s.price === '' || Number(s.price) < 0)) {
        toast.error(t('servicesPage.priceRequired'));
        return;
      }
    }
    const ok = await handleSaveAll([...list, ...filled]);
    if (ok) closeAddModal();
  };

  const startEdit = (idx: number) => {
    setEditingIndex(idx);
  };

  const saveEdit = async () => {
    if (editingIndex === null) return;
    const s = list[editingIndex];
    if (!s?.title.trim()) {
      toast.error(t('servicesPage.titleRequired'));
      return;
    }
    if (s.priceType === 'FIXED' && (s.price === '' || Number(s.price) < 0)) {
      toast.error(t('servicesPage.priceRequired'));
      return;
    }
    setEditingIndex(null);
    await handleSaveAll();
  };

  const cancelForm = () => {
    if (editingIndex !== null && servicesList[editingIndex]) {
      const original = servicesList[editingIndex];
      setList((prev) => prev.map((s, i) => (i === editingIndex ? { ...original } : s)));
    }
    setEditingIndex(null);
  };

  const handleSaveAll = async (listOverride?: ServiceItem[]): Promise<boolean> => {
    const source = listOverride ?? list;
    const toSend: MasterServiceItem[] = source
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        priceType: s.priceType,
        price: s.priceType === 'FIXED' && s.price !== '' ? Number(s.price) : undefined,
        currency: s.priceType === 'FIXED' ? s.currency : undefined,
      }));
    try {
      const result = await updateServices({ services: toSend }).unwrap();
      toast.success(t('servicesPage.saved'));
      setEditingIndex(null);
      const updated = (result as { services?: unknown })?.services;
      if (updated !== undefined) setList(normalizeServices(updated));
      await refetch();
      return true;
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('servicesPage.saveFailed'));
      return false;
    }
  };

  const handleDelete = async (idx: number) => {
    const serviceToDelete = list[idx];
    if (serviceToDelete) {
      const linkedPromotion = promotions.find(p => p.serviceTitle?.trim() === serviceToDelete.title.trim());
      if (linkedPromotion) {
        try {
          await deletePromotion(linkedPromotion.id).unwrap();
        } catch (e) {
          console.error('Failed to delete associated promotion', e);
        }
      }
    }

    const nextList = list.filter((_, i) => i !== idx);
    setList(nextList);
    setDeleteIndex(null);
    if (editingIndex === idx) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > idx) setEditingIndex(editingIndex - 1);
    await handleSaveAll(nextList);
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
    <VerificationGate isVerified={isVerified}>
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('servicesPage.title')}
        subtitle={t('servicesPage.subtitle')}
      />

      <Alert className="mb-6 rounded-xl border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <ListChecks className="size-5 text-emerald-600 dark:text-emerald-400" />
        <AlertDescription>
          {t('servicesPage.hint')}
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">{t('servicesPage.listTitle')}</h2>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={openAddModal}
              className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Plus className="size-4" />
              {t('servicesPage.add')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {list.map((service, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border-2 border-border/80 transition hover:border-emerald-500/40 hover:shadow-lg dark:hover:border-emerald-500/30"
            >
              <CardContent className="p-0">
                {editingIndex === idx && formService ? (
                  <div className="p-4 bg-muted/30">
                    <ServiceForm
                      service={formService}
                      onChange={setFormService}
                      onSave={saveEdit}
                      onCancel={cancelForm}
                      saving={saving}
                      saveIcon={<Save className="size-3" />}
                      saveLabel={t('common.save')}
                    />
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">{service.title || t('servicesPage.untitled')}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {service.priceType === 'FIXED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                            <DollarSign className="size-3" />
                            {service.price !== '' ? `${service.price} ${service.currency}` : '—'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                            <HandCoins className="size-3" />
                            {t('servicesPage.priceNegotiable')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-lg text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit(idx)}
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-lg text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteIndex(idx)}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {list.length === 0 && (
          <Card className="rounded-xl border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ListChecks className="size-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">{t('servicesPage.empty')}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2 rounded-xl border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                onClick={openAddModal}
              >
                <Plus className="size-4" />
                {t('servicesPage.add')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={addModalOpen} onOpenChange={(open) => (open ? setAddModalOpen(true) : closeAddModal())}>
        <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-1.5rem)] max-w-2xl flex-col gap-0 p-0 sm:w-full">
          <DialogHeader className="text-left">
            <DialogTitle>{t('servicesPage.bulkModalTitle')}</DialogTitle>
            <DialogDescription>{t('servicesPage.bulkModalHint')}</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 px-4 sm:px-6">
            {pendingAdds.map((row, index) => (
              <div
                key={index}
                className="relative rounded-xl border border-border/80 bg-muted/20 p-3 sm:p-4 dark:bg-white/[0.03]"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-border/50 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('servicesPage.bulkRowLabel', { n: index + 1 })}
                  </span>
                  {pendingAdds.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => removePendingRow(index)}
                      aria-label={t('servicesPage.removeRow')}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
                <ServiceFormFields
                  service={row}
                  onChange={(updater) => updatePendingRow(index, updater)}
                  idPrefix={`bulk-${index}`}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 rounded-xl border-dashed border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              onClick={addAnotherRow}
            >
              <Plus className="size-4" />
              {t('servicesPage.addAnother')}
            </Button>
          </DialogBody>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" className="w-full rounded-xl sm:w-auto" onClick={closeAddModal}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              disabled={saving}
              className="w-full gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
              onClick={() => void saveBulkAdds()}
            >
              <Plus className="size-4" />
              {t('servicesPage.bulkSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteIndex !== null && (
        <ConfirmDialog
          open
          onClose={() => setDeleteIndex(null)}
          onConfirm={() => handleDelete(deleteIndex)}
          title={t('servicesPage.deleteConfirm')}
          description={(() => {
            const svc = list[deleteIndex];
            const p = svc ? promotions.find(p => p.serviceTitle?.trim() === svc.title.trim()) : null;
            return p 
              ? `${t('servicesPage.deleteMessage')}\n\n⚠️ ${t('servicesPage.deleteWarningWithPromotion')}`
              : t('servicesPage.deleteMessage');
          })()}
          confirmText={t('common.delete')}
          confirmColor="error"
        />
      )}
    </div>
    </VerificationGate>
  );
}
