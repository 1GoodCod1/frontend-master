import React from 'react';
import { CloudUpload, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectPlan, selectIsVerified } from '@/features/auth/selectors';
import { useFilesUploadMutation } from '@/features/files/filesApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { MasterGalleryGrid } from '@/components/ui/MasterGalleryGrid';
import {
  useMastersMyPhotosQuery,
  useMastersRemovePhotoMutation,
  useMastersSetAvatarMutation,
} from '@/features/masters/masterPhotosApi';
import { TariffPlan, maxPhotosForPlan } from '@/features/auth/plan';
import type { FileDto } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FilesPage() {
  const { t } = useTranslation();
  const photos = useMastersMyPhotosQuery();
  const [upload, up] = useFilesUploadMutation();
  const [setAvatar, setAvatarState] = useMastersSetAvatarMutation();
  const [removePhoto, removeState] = useMastersRemovePhotoMutation();

  const plan: TariffPlan = useAppSelector(selectPlan) ?? 'BASIC';
  const isVerified = useAppSelector(selectIsVerified);
  const limit = maxPhotosForPlan(plan);

  const busyId =
    (setAvatarState as { originalArgs?: { fileId?: string } })?.originalArgs?.fileId ??
    (removeState as { originalArgs?: { fileId?: string } })?.originalArgs?.fileId ??
    null;
  const busy = up.isLoading || setAvatarState.isLoading || removeState.isLoading;

  const avatarFileId = photos.data?.avatarFileId ?? null;
  const items = Array.isArray(photos.data?.items) ? photos.data.items : [];
  const reached = items.length >= limit;

  const normalizedItems: FileDto[] = items.map((f: FileDto & { url?: string }) => ({
    ...f,
    path: f.path ?? f.url ?? '',
  }));

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isVerified) {
      toast.error(t('files.uploadDisabledVerification'));
      e.target.value = '';
      return;
    }
    if (reached) {
      toast.error(t('files.photoLimitReached', { current: items.length, limit }));
      e.target.value = '';
      return;
    }

    try {
      await upload({ file }).unwrap();
      toast.success(t('files.uploadedSuccess'));
      photos.refetch();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err && (err as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || (err instanceof Error ? err.message : t('files.uploadFailed')));
    } finally {
      e.target.value = '';
    }
  }

  if (photos.isLoading) return <LoadingState />;
  if (photos.isError) return <ErrorState error={photos.error} onRetry={photos.refetch} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader title={t('files.title')} subtitle={t('files.subtitle')} />
      </div>

      <Card className="mb-6 overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition duration-300">
        <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-500">
              <CloudUpload className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('files.upload')}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{t('files.uploadSubtitle')}</p>
            </div>
          </div>
          <Button asChild disabled={up.isLoading || reached || !isVerified} className="border-0 font-semibold bg-amber-600 text-white shadow-md transition hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500">
            <label className="flex cursor-pointer items-center gap-2">
              <CloudUpload className="size-4" />
              {!isVerified
                ? t('files.uploadDisabledVerification')
                : reached
                  ? t('files.limitReachedButton')
                  : up.isLoading
                    ? t('files.uploadingButton')
                    : t('files.uploadImageButton')}
              <input
                type="file"
                accept="image/*"
                onChange={onPick}
                disabled={!isVerified}
                className="hidden"
              />
            </label>
          </Button>
        </div>
        <CardContent className="p-6">
          <Alert className="rounded-lg border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.04]">
            <AlertDescription>
              <p>{t('files.rulesHint', { limit, current: items.length })}</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition duration-300">
        <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('files.myGallery')}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{t('files.myGallerySubtitle')}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          {!items.length ? (
            <EmptyState
              title={t('files.noPhotosYet')}
              description={t('files.noPhotosDescription')}
              icon="🖼️"
            />
          ) : (
            <MasterGalleryGrid
              items={normalizedItems}
              avatarFileId={avatarFileId}
              busyId={busy ? busyId : null}
              variant="gallery"
              onSetAvatar={async (fileId) => {
                try {
                  await setAvatar({ fileId }).unwrap();
                  toast.success(t('files.avatarUpdated'));
                  photos.refetch();
                } catch (e: unknown) {
                  const msg =
                    e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
                  toast.error((msg as string) || (e instanceof Error ? e.message : t('files.failedToSetAvatar')));
                }
              }}
              onRemove={async (fileId) => {
                try {
                  const wasAvatar = avatarFileId === fileId;
                  const remainingCount = items.filter((i) => i.id !== fileId).length;

                  await removePhoto({ fileId }).unwrap();
                  photos.refetch();

                  if (wasAvatar && remainingCount > 0) {
                    toast.success(t('files.removedAndAvatarAutoSet'));
                  } else {
                    toast.success(t('files.removeFromGallery'));
                  }
                } catch (e: unknown) {
                  const msg =
                    e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
                  toast.error((msg as string) || (e instanceof Error ? e.message : t('files.failedToRemovePhoto')));
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
