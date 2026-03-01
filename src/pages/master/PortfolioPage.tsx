import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/hooks';
import {
  usePortfolioByMasterQuery,
  usePortfolioCreateMutation,
  usePortfolioUpdateMutation,
  usePortfolioDeleteMutation,
} from '@/features/portfolio/portfolioApi';
import { useMastersMyPhotosQuery } from '@/features/masters/masterPhotosApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BeforeAfterSlider } from '@/components/portfolio/BeforeAfterSlider';
import { mediaUrl } from '@/utils/media';
import type { PortfolioItemDto } from '@/types';
import type { FileDto } from '@/types';
import '@/components/portfolio/portfolio.css';

function getCurrentUserMasterId(me: unknown): string | undefined {
  if (!me || typeof me !== 'object') return undefined;
  const rec = me as {
    masterProfile?: { id?: unknown } | null;
    master?: { id?: unknown } | null;
  };
  const id1 = rec.masterProfile?.id;
  if (typeof id1 === 'string') return id1;
  const id2 = rec.master?.id;
  if (typeof id2 === 'string') return id2;
  return undefined;
}

export default function PortfolioPage() {
  const { t } = useTranslation();
  const me = useAppSelector((s) => s.auth.me);
  const masterId = getCurrentUserMasterId(me);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItemDto | null>(null);

  const portfolioQuery = usePortfolioByMasterQuery(
    { masterId: masterId ?? '' },
    { skip: !masterId }
  );
  const photosQuery = useMastersMyPhotosQuery(undefined, { skip: !masterId });
  const [createItem, createState] = usePortfolioCreateMutation();
  const [updateItem, updateState] = usePortfolioUpdateMutation();
  const [deleteItem, deleteState] = usePortfolioDeleteMutation();

  const items = (portfolioQuery.data as PortfolioItemDto[]) ?? [];
  const photos = photosQuery.data?.items ?? [];
  const photosWithId = photos.filter((p): p is FileDto & { id: string } => !!p?.id);

  const handleCreate = async (data: {
    beforeFileId: string;
    afterFileId: string;
    title?: string;
    description?: string;
    serviceTags?: string[];
  }) => {
    if (!masterId) return;
    try {
      await createItem(data).unwrap();
      toast.success(t('portfolio.created'));
      setCreateOpen(false);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        (err as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || (err instanceof Error ? err.message : t('portfolio.createFailed')));
    }
  };

  const handleUpdate = async (
    id: string,
    data: { title?: string; description?: string; serviceTags?: string[] }
  ) => {
    try {
      await updateItem({ id, data }).unwrap();
      toast.success(t('portfolio.updated'));
      setEditingItem(null);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        (err as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || (err instanceof Error ? err.message : t('portfolio.updateFailed')));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('portfolio.deleteConfirm'))) return;
    try {
      await deleteItem(id).unwrap();
      toast.success(t('portfolio.deleted'));
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        (err as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || (err instanceof Error ? err.message : t('portfolio.deleteFailed')));
    }
  };

  if (!masterId) {
    return <ErrorState error={t('portfolio.masterNotFound')} />;
  }

  if (portfolioQuery.isLoading) return <LoadingState />;
  if (portfolioQuery.isError) {
    return (
      <ErrorState
        error={portfolioQuery.error}
        onRetry={portfolioQuery.refetch}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title={t('portfolio.title')}
          subtitle={t('portfolio.subtitle')}
        />
        <Button
          onClick={() => setCreateOpen(true)}
          disabled={photosWithId.length < 2}
          className="gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          <Plus className="size-4" />
          {t('portfolio.addWork')}
        </Button>
      </div>

      {photosWithId.length < 2 && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              {t('portfolio.needPhotosHint', { count: 2 })}
            </p>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={t('portfolio.noWorks')}
          description={t('portfolio.noWorksDescription')}
          icon={<Layers className="size-16 text-amber-500" />}
        />
      ) : (
        <div className="portfolio-grid">
          {items.map((item) => (
            <Card key={item.id} className="portfolio-card overflow-hidden">
              <div className="relative">
                <BeforeAfterSlider
                  beforeSrc={mediaUrl(item.beforeFile?.path)}
                  afterSrc={mediaUrl(item.afterFile?.path)}
                  beforeAlt={item.title ? `${item.title} — до` : 'До'}
                  afterAlt={item.title ? `${item.title} — после` : 'После'}
                  height={240}
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-8 rounded-full bg-white/90 dark:bg-black/60"
                    onClick={() => setEditingItem(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-8 rounded-full bg-white/90 text-red-600 hover:bg-red-100 dark:bg-black/60 dark:text-red-400"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteState.isLoading}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {(item.title || item.description) && (
                <CardContent className="p-4">
                  {item.title && (
                    <h4 className="font-semibold">{item.title}</h4>
                  )}
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <CreatePortfolioDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        photos={photosWithId}
        onSubmit={handleCreate}
        isLoading={createState.isLoading}
      />

      {editingItem && (
        <EditPortfolioDialog
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(data) => handleUpdate(editingItem.id, data)}
          isLoading={updateState.isLoading}
        />
      )}
    </div>
  );
}

// ─── Create Dialog ───────────────────────────────────────────────────────

interface CreatePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: (FileDto & { id: string })[];
  onSubmit: (data: {
    beforeFileId: string;
    afterFileId: string;
    title?: string;
    description?: string;
    serviceTags?: string[];
  }) => void;
  isLoading: boolean;
}

function CreatePortfolioDialog({
  open,
  onOpenChange,
  photos,
  onSubmit,
  isLoading,
}: CreatePortfolioDialogProps) {
  const { t } = useTranslation();
  const [beforeFileId, setBeforeFileId] = useState('');
  const [afterFileId, setAfterFileId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeFileId || !afterFileId) {
      toast.error(t('portfolio.selectBothPhotos'));
      return;
    }
    if (beforeFileId === afterFileId) {
      toast.error(t('portfolio.samePhotoError'));
      return;
    }
    onSubmit({
      beforeFileId,
      afterFileId,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  const handleClose = () => {
    setBeforeFileId('');
    setAfterFileId('');
    setTitle('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('portfolio.addWork')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('portfolio.photoBefore')}</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setBeforeFileId(p.id)}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    beforeFileId === p.id
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img
                    src={mediaUrl(p.path ?? (p as { url?: string }).url)}
                    alt=""
                    className="size-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>{t('portfolio.photoAfter')}</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAfterFileId(p.id)}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    afterFileId === p.id
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img
                    src={mediaUrl(p.path ?? (p as { url?: string }).url)}
                    alt=""
                    className="size-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="title">{t('portfolio.titleField')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('portfolio.titlePlaceholder')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">{t('portfolio.descriptionField')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('portfolio.descriptionPlaceholder')}
              rows={2}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : t('portfolio.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────

interface EditPortfolioDialogProps {
  item: PortfolioItemDto;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    description?: string;
    serviceTags?: string[];
  }) => void;
  isLoading: boolean;
}

function EditPortfolioDialog({
  item,
  onClose,
  onSubmit,
  isLoading,
}: EditPortfolioDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(item.title ?? '');
  const [description, setDescription] = useState(item.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('portfolio.editWork')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">{t('portfolio.titleField')}</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('portfolio.titlePlaceholder')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">
              {t('portfolio.descriptionField')}
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('portfolio.descriptionPlaceholder')}
              rows={3}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : t('portfolio.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
