import React from 'react';
import { CloudUpload, ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectPlan, selectIsVerified } from '@/features/auth/selectors';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { CabinetEmptyState } from '@/components/cabinet/CabinetEmptyState';
import { MasterGalleryGrid } from '@/components/ui/MasterGalleryGrid';
import {
  useMastersMyPhotosQuery,
  useMastersRemovePhotoMutation,
  useMastersSetAvatarMutation,
} from '@/features/masters/masterPhotosApi';
import { TariffPlan, maxPhotosForPlan } from '@/features/auth/plan';
import type { FileDto } from '@/types';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toErrorMessage } from '@/utils/errors';
import { cn } from '@/lib/utils';
import {
  masterCardStaticCls,
  masterIconWrapCls,
  masterInsetPanelCls,
  masterOutlineBtnCls,
  masterPageClassName,
  masterPrimaryBtnCls,
  masterSectionTitleCls,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';

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
    <div className={masterPageClassName}>
      <PageHeader title={t('files.title')} subtitle={t('files.subtitle')} />

      <div className={cn(masterCardStaticCls, 'overflow-hidden')}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] px-6 py-5 dark:border-[#2d2d2d]">
          <div className="flex items-center gap-3">
            <span className={masterIconWrapCls}>
              <CloudUpload className="size-5" />
            </span>
            <div>
              <h2 className={masterSectionTitleCls}>{t('files.upload')}</h2>
              <p className={masterTextMuted}>{t('files.uploadSubtitle')}</p>
            </div>
          </div>
          <Button
            asChild
            disabled={isUploading || reached || !isVerified}
            className={masterPrimaryBtnCls}
          >
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

        <CardContent className="space-y-4 p-6">
          <Alert className={cn(masterInsetPanelCls, 'border-[#e8e8e8] dark:border-[#2d2d2d]')}>
            <AlertDescription>
              <p className={masterTextMuted}>{t('files.rulesHint', { limit, current: items.length })}</p>
            </AlertDescription>
          </Alert>

          {staged.length > 0 && (
            <div className="space-y-3">
              <p className={masterTextMuted}>{t('files.selectedCount', { count: staged.length })}</p>
              <div className="flex flex-wrap gap-3">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="group relative size-20 overflow-hidden rounded-xl border border-[#e8e8e8] dark:border-[#2d2d2d]"
                  >
                    <img src={src} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpload} disabled={isUploading} className={masterPrimaryBtnCls}>
                  <CloudUpload className="mr-1.5 size-4" />
                  {isUploading ? t('files.uploadingButton') : t('files.uploadAllButton', { count: staged.length })}
                </Button>
                <Button size="sm" variant="outline" onClick={clear} disabled={isUploading} className={masterOutlineBtnCls}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <div className={cn(masterCardStaticCls, 'mt-6 overflow-hidden')}>
        <div className="border-b border-[#e8e8e8] px-6 py-5 dark:border-[#2d2d2d]">
          <div className="flex items-center gap-3">
            <span className={masterIconWrapCls}>
              <ImageIcon className="size-5" />
            </span>
            <div>
              <h2 className={masterSectionTitleCls}>{t('files.myGallery')}</h2>
              <p className={masterTextMuted}>{t('files.myGallerySubtitle')}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          {!items.length ? (
            <CabinetEmptyState
              icon={ImageIcon}
              title={t('files.noPhotosYet')}
              description={t('files.noPhotosDescription')}
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
      </div>
    </div>
  );
}
