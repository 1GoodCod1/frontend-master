import { useState } from 'react';
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
import { BeforeAfterSlider } from '@/features/portfolio/components/BeforeAfterSlider';
import { CreatePortfolioDialog } from '@/features/portfolio/components/CreatePortfolioDialog';
import { EditPortfolioDialog } from '@/features/portfolio/components/EditPortfolioDialog';
import { mediaUrl } from '@/utils/media';
import { toErrorMessage } from '@/utils/errors';
import { getCurrentUserMasterId } from '@/utils/user';
import type { PortfolioItemDto } from '@/types';
import type { FileDto } from '@/types';
import '@/features/portfolio/components/portfolio.css';

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
      toast.error(toErrorMessage(err) ?? t('portfolio.createFailed'));
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
      toast.error(toErrorMessage(err) ?? t('portfolio.updateFailed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('portfolio.deleteConfirm'))) return;
    try {
      await deleteItem(id).unwrap();
      toast.success(t('portfolio.deleted'));
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) ?? t('portfolio.deleteFailed'));
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

