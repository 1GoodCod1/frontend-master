import React from 'react';
import { CloudUpload, ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectPlan, selectIsVerified } from '@/features/auth/selectors';
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
import { useFileUpload } from '@/hooks/useFileUpload';
import { toErrorMessage } from '@/utils/errors';

export default function FilesPage() {
  const { t } = useTranslation();
  const photos = useMastersMyPhotosQuery();
  const [setAvatar, setAvatarState] = useMastersSetAvatarMutation();
  const [removePhoto, removeState] = useMastersRemovePhotoMutation();

  const plan: TariffPlan = useAppSelector(selectPlan) ?? 'BASIC';
  const isVerified = useAppSelector(selectIsVerified);
  const limit = maxPhotosForPlan(plan);

  const items = Array.isArray(photos.data?.items) ? photos.data!.items : [];
  const remaining = limit - items.length;
  const reached = remaining <= 0;

  const { files: staged, previews, isUploading, pickFiles, upload, removeFile, clear } =
    useFileUpload({ maxFiles: remaining > 0 ? remaining : 0 });

  const busyId =
    (setAvatarState as { originalArgs?: { fileId?: string } })?.originalArgs?.fileId ??
    (removeState as { originalArgs?: { fileId?: string } })?.originalArgs?.fileId ??
    null;
  const busy = isUploading || setAvatarState.isLoading || removeState.isLoading;

  const avatarFileId = photos.data?.avatarFileId ?? null;

  const normalizedItems: FileDto[] = items.map((f: FileDto & { url?: string }) => ({
    ...f,
    path: f.path ?? f.url ?? '',
  }));

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
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
    pickFiles(e.target.files ?? []);
    e.target.value = '';
  }

  async function handleUpload() {
    const results = await upload();
    if (results && results.length > 0) {
      toast.success(t('files.uploadedSuccess'));
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
          <Button asChild disabled={isUploading || reached || !isVerified} className="border-0 font-semibold bg-amber-600 text-white shadow-md transition hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500">
            <label className="flex cursor-pointer items-center gap-2">
              <CloudUpload className="size-4" />
              {!isVerified
                ? t('files.uploadDisabledVerification')
                : reached
                  ? t('files.limitReachedButton')
                  : isUploading
                    ? t('files.uploadingButton')
                    : t('files.uploadImageButton')}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPick}
                disabled={!isVerified || reached}
                className="hidden"
              />
            </label>
          </Button>
        </div>

        <CardContent className="p-6 space-y-4">
          <Alert className="rounded-lg border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.04]">
            <AlertDescription>
              <p>{t('files.rulesHint', { limit, current: items.length })}</p>
            </AlertDescription>
          </Alert>

          {staged.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {t('files.selectedCount', { count: staged.length })}
              </p>
              <div className="flex flex-wrap gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="group relative size-20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/[0.08]">
                    <img src={src} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpload} disabled={isUploading} className="font-semibold">
                  <CloudUpload className="mr-1.5 size-4" />
                  {isUploading ? t('files.uploadingButton') : t('files.uploadAllButton', { count: staged.length })}
                </Button>
                <Button size="sm" variant="outline" onClick={clear} disabled={isUploading}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
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
                } catch (e: unknown) {
                  toast.error(toErrorMessage(e) ?? t('files.failedToSetAvatar'));
                }
              }}
              onRemove={async (fileId) => {
                try {
                  const wasAvatar = avatarFileId === fileId;
                  const remainingCount = items.filter((i) => i.id !== fileId).length;

                  await removePhoto({ fileId }).unwrap();

                  if (wasAvatar && remainingCount > 0) {
                    toast.success(t('files.removedAndAvatarAutoSet'));
                  } else {
                    toast.success(t('files.removeFromGallery'));
                  }
                } catch (e: unknown) {
                  toast.error(toErrorMessage(e) ?? t('files.failedToRemovePhoto'));
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
