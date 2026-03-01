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
  X,
} from 'lucide-react';
import { useMastersMyProfileQuery, useMastersUpdateMyProfileMutation } from '@/features/masters/mastersApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

type ServiceItem = {
  title: string;
  priceType: 'FIXED' | 'NEGOTIABLE';
  price: number | '';
  currency: 'MDL' | 'EUR' | 'USD';
};

const defaultService = (): ServiceItem => ({
  title: '',
  priceType: 'NEGOTIABLE',
  price: '',
  currency: 'MDL',
});

function normalizeServices(raw: unknown): ServiceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: any) => ({
    title: typeof item?.title === 'string' ? item.title : '',
    priceType: item?.priceType === 'FIXED' ? 'FIXED' : 'NEGOTIABLE',
    price: item?.priceType === 'FIXED' && item?.price != null ? Number(item.price) : '',
    currency: item?.currency === 'EUR' || item?.currency === 'USD' ? item.currency : 'MDL',
  }));
}

export default function ServicesPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useMastersMyProfileQuery();
  const [update, { isLoading: saving }] = useMastersUpdateMyProfileMutation();

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
  const [isAdding, setIsAdding] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const lastSyncedServicesRef = useRef<ServiceItem[]>(servicesList);

  // Sync list from server only when server data actually changed (e.g. after refetch),
  // not when we just closed the edit form (otherwise we'd overwrite local edits).
  useEffect(() => {
    if (isAdding || editingIndex !== null) return;
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
      setList(servicesList);
    }
  }, [servicesList, isAdding, editingIndex]);

  const formService = editingIndex !== null ? list[editingIndex] ?? defaultService() : isAdding ? (list[list.length - 1] ?? defaultService()) : null;
  const setFormService = (updater: (prev: ServiceItem) => ServiceItem) => {
    if (editingIndex !== null) {
      setList((prev) => prev.map((s, i) => (i === editingIndex ? updater(s) : s)));
    } else if (isAdding) {
      setList((prev) => prev.map((s, i) => (i === prev.length - 1 ? updater(s) : s)));
    }
  };

  const startAdd = () => {
    setEditingIndex(null);
    setIsAdding(true);
    setList((prev) => [...prev, defaultService()]);
  };

  const saveAdd = async () => {
    const newOne = list[list.length - 1];
    if (!newOne?.title.trim()) {
      toast.error(t('servicesPage.titleRequired'));
      return;
    }
    if (newOne.priceType === 'FIXED' && (newOne.price === '' || Number(newOne.price) < 0)) {
      toast.error(t('servicesPage.priceRequired'));
      return;
    }
    setIsAdding(false);
    await handleSaveAll();
  };

  const startEdit = (idx: number) => {
    setIsAdding(false);
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
    if (isAdding) {
      setList((prev) => prev.slice(0, -1));
      setIsAdding(false);
    } else {
      // Revert edited item to original from server
      if (editingIndex !== null && servicesList[editingIndex]) {
        const original = servicesList[editingIndex];
        setList((prev) =>
          prev.map((s, i) => (i === editingIndex ? { ...original } : s))
        );
      }
      setEditingIndex(null);
    }
  };

  const handleSaveAll = async (listOverride?: ServiceItem[]) => {
    const source = listOverride ?? list;
    const toSend = source
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        priceType: s.priceType,
        price: s.priceType === 'FIXED' && s.price !== '' ? Number(s.price) : undefined,
        currency: s.priceType === 'FIXED' ? s.currency : undefined,
      }));
    try {
      const result = await update({ services: toSend } as any).unwrap();
      toast.success(t('servicesPage.saved'));
      setIsAdding(false);
      setEditingIndex(null);
      const updated = (result as { services?: unknown })?.services ?? (result as { data?: { services?: unknown } })?.data?.services;
      if (updated !== undefined) setList(normalizeServices(updated));
      await refetch();
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || t('servicesPage.saveFailed'));
    }
  };

  const handleDelete = async (idx: number) => {
    const nextList = list.filter((_, i) => i !== idx);
    setList(nextList);
    setDeleteIndex(null);
    if (editingIndex === idx) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > idx) setEditingIndex(editingIndex - 1);
    await handleSaveAll(nextList);
  };

  const displayList = isAdding ? list.slice(0, -1) : list;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
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
            {!isAdding && (
              <Button
                type="button"
                onClick={startAdd}
                className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Plus className="size-4" />
                {t('servicesPage.add')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {displayList.map((service, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border-2 border-border/80 transition-all hover:border-emerald-500/40 hover:shadow-lg dark:hover:border-emerald-500/30"
            >
              <CardContent className="p-0">
                {editingIndex === idx && formService ? (
                  <div className="p-4 space-y-4 bg-muted/30">
                    <Label className="text-xs font-medium">{t('servicesPage.serviceName')}</Label>
                    <Input
                      value={formService.title}
                      onChange={(e) => setFormService((s) => ({ ...s, title: e.target.value }))}
                      placeholder={t('servicesPage.serviceNamePlaceholder')}
                      className="rounded-lg bg-background"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t('servicesPage.priceType')}</Label>
                        <Select
                          value={formService.priceType}
                          onValueChange={(v: 'FIXED' | 'NEGOTIABLE') =>
                            setFormService((s) => ({ ...s, priceType: v, price: v === 'NEGOTIABLE' ? '' : s.price }))
                          }
                        >
                          <SelectTrigger className="mt-1 rounded-lg bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEGOTIABLE">{t('servicesPage.priceNegotiable')}</SelectItem>
                            <SelectItem value="FIXED">{t('servicesPage.priceFixed')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formService.priceType === 'FIXED' && (
                        <>
                          <div>
                            <Label className="text-xs">{t('servicesPage.price')}</Label>
                            <Input
                              type="number"
                              min={0}
                              value={formService.price === '' ? '' : formService.price}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === '') return setFormService((s) => ({ ...s, price: '' }));
                                const n = Number(v);
                                if (Number.isFinite(n) && n >= 0) setFormService((s) => ({ ...s, price: n }));
                              }}
                              className="mt-1 rounded-lg bg-background"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">{t('servicesPage.currency')}</Label>
                            <Select
                              value={formService.currency}
                              onValueChange={(v: 'MDL' | 'EUR' | 'USD') => setFormService((s) => ({ ...s, currency: v }))}
                            >
                              <SelectTrigger className="mt-1 rounded-lg bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MDL">MDL</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="button" size="sm" onClick={saveEdit} disabled={saving} className="gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700">
                        <Save className="size-3" /> {t('common.save')}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={cancelForm} className="gap-1 rounded-lg">
                        <X className="size-3" /> {t('common.cancel')}
                      </Button>
                    </div>
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

        {isAdding && formService && (
          <Card className="overflow-hidden border-2 border-dashed border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-foreground">{t('servicesPage.newService')}</h3>
              <div>
                <Label className="text-xs font-medium">{t('servicesPage.serviceName')}</Label>
                <Input
                  value={formService.title}
                  onChange={(e) => setFormService((s) => ({ ...s, title: e.target.value }))}
                  placeholder={t('servicesPage.serviceNamePlaceholder')}
                  className="mt-1 rounded-lg bg-background"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">{t('servicesPage.priceType')}</Label>
                  <Select
                    value={formService.priceType}
                    onValueChange={(v: 'FIXED' | 'NEGOTIABLE') =>
                      setFormService((s) => ({ ...s, priceType: v, price: v === 'NEGOTIABLE' ? '' : s.price }))
                    }
                  >
                    <SelectTrigger className="mt-1 rounded-lg bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEGOTIABLE">{t('servicesPage.priceNegotiable')}</SelectItem>
                      <SelectItem value="FIXED">{t('servicesPage.priceFixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formService.priceType === 'FIXED' && (
                  <>
                    <div>
                      <Label className="text-xs">{t('servicesPage.price')}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={formService.price === '' ? '' : formService.price}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '') return setFormService((s) => ({ ...s, price: '' }));
                          const n = Number(v);
                          if (Number.isFinite(n) && n >= 0) setFormService((s) => ({ ...s, price: n }));
                        }}
                        className="mt-1 rounded-lg bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t('servicesPage.currency')}</Label>
                      <Select
                        value={formService.currency}
                        onValueChange={(v: 'MDL' | 'EUR' | 'USD') => setFormService((s) => ({ ...s, currency: v }))}
                      >
                        <SelectTrigger className="mt-1 rounded-lg bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MDL">MDL</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" size="sm" onClick={saveAdd} disabled={saving} className="gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="size-3" /> {t('servicesPage.addService')}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={cancelForm} className="gap-1 rounded-lg">
                  <X className="size-3" /> {t('common.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {displayList.length === 0 && !isAdding && (
          <Card className="rounded-xl border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ListChecks className="size-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">{t('servicesPage.empty')}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2 rounded-xl border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                onClick={startAdd}
              >
                <Plus className="size-4" />
                {t('servicesPage.add')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {deleteIndex !== null && (
        <ConfirmDialog
          open
          onClose={() => setDeleteIndex(null)}
          onConfirm={() => handleDelete(deleteIndex)}
          title={t('servicesPage.deleteConfirm')}
          description={t('servicesPage.deleteMessage')}
          confirmText={t('common.delete')}
          confirmColor="error"
        />
      )}
    </div>
  );
}
