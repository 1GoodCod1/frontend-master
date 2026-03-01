import { useTranslation } from 'react-i18next';
import { ImageIcon, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MasterGalleryGrid } from '@/components/ui/MasterGalleryGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState, ErrorState } from '@/components/common/States';

interface PhotoGallerySectionProps {
  photoItems: unknown[];
  avatarFileId: string | null;
  reachedLimit: boolean;
  photoLimit: number;
  isVerified?: boolean;
  uploadLoading: boolean;
  setAvatarLoading: boolean;
  removePhotoLoading: boolean;
  busyFileId: string | null;
  photosLoading: boolean;
  photosError: unknown;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetAvatar: (fileId: string) => Promise<void>;
  onRemovePhoto: (fileId: string) => Promise<void>;
  onPhotosRefetch: () => void;
}

export default function PhotoGallerySection({
  photoItems,
  avatarFileId,
  reachedLimit,
  photoLimit,
  isVerified = true,
  uploadLoading,
  setAvatarLoading: _setAvatarLoading,
  removePhotoLoading: _removePhotoLoading,
  busyFileId,
  photosLoading,
  photosError,
  onFileUpload,
  onSetAvatar,
  onRemovePhoto,
  onPhotosRefetch,
}: PhotoGallerySectionProps) {
  const { t } = useTranslation();

  const buttonLabel = !isVerified
    ? t('clientProfile.uploadDisabledVerification')
    : reachedLimit
      ? t('clientProfile.limitReached')
      : uploadLoading
        ? t('clientProfile.uploading')
        : t('clientProfile.uploadPhoto');

  return (
    <Card className="mt-6 border-border bg-card transition-shadow hover:shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-gradient-to-br from-primary/5 to-violet-500/5 px-6 py-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-5 text-primary opacity-80" />
          <div>
            <h3 className="font-bold text-foreground">{t('clientProfile.myGallery')}</h3>
            <p className="text-sm text-muted-foreground">{t('clientProfile.gallerySubtitle')}</p>
          </div>
        </div>
        <input
          accept="image/*"
          className="hidden"
          id="gallery-photo-upload"
          type="file"
          onChange={onFileUpload}
          disabled={uploadLoading || reachedLimit || !isVerified}
        />
        <label htmlFor="gallery-photo-upload">
          <span
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            aria-disabled={uploadLoading || reachedLimit || !isVerified}
          >
            <Camera className="size-4" />
            {buttonLabel}
          </span>
        </label>
      </div>

      <CardContent className="p-6">
        {photosLoading ? (
          <LoadingState label={t('clientProfile.loadingGallery')} />
        ) : photosError ? (
          <ErrorState error={photosError as Error} onRetry={onPhotosRefetch} />
        ) : !photoItems.length ? (
          <EmptyState
            title={t('clientProfile.noPhotosYet')}
            description={t('clientProfile.noPhotosDescription', { limit: photoLimit })}
            icon="🖼️"
          />
        ) : (
          <>
            {reachedLimit && (
              <Alert className="mb-6 border-primary/30 bg-primary/5">
                <AlertDescription>{t('clientProfile.limitReachedAlert')}</AlertDescription>
              </Alert>
            )}
            <MasterGalleryGrid
              items={photoItems.map((f) => {
                const item = f as Record<string, unknown> & { path?: string; url?: string };
                return { ...item, path: item.path ?? item.url ?? '' };
              }) as import('@/types').FileDto[]}
              avatarFileId={avatarFileId}
              busyId={busyFileId}
              onSetAvatar={onSetAvatar}
              onRemove={onRemovePhoto}
              max={photoLimit}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
