import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Images } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LazyImage } from '@/components/ui/LazyImage';
import { ErrorState } from '@/components/common/States';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';
import { mediaUrl } from '@/utils/media';
import { masterDetailCardCls, masterDetailIconWrapCls, masterDetailInsetCls } from '@/features/masters/components/masterDetailsUi';
import { cn } from '@/lib/utils';

type PhotoItem = { id?: string; path?: string; url?: string; filename?: string };

interface MasterDetailsGalleryProps {
  photos: PhotoItem[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

export const MasterDetailsGallery = ({
  photos,
  isLoading,
  isError,
  error,
  onRetry,
}: MasterDetailsGalleryProps) => {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imageUrls = photos.map((f: { path?: string; url?: string }) => mediaUrl(f.path ?? f.url)).filter(Boolean);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Card className={masterDetailCardCls}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={masterDetailIconWrapCls}>
            <Images className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-gray-900 dark:text-gray-100 font-semibold">
              {t('masterDetails.gallery')}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">{t('masterDetails.loadingPhotos')}</p>
        ) : isError ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : !photos.length ? (
          <div className={cn('h-48 border-2 border-dashed border-[#f5f4eb] dark:border-white/10 bg-amber-100/50 dark:bg-white/[0.03] flex items-center justify-center', masterDetailInsetCls)}>
            <p className="text-muted-foreground">{t('masterDetails.noPhotosYet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {photos.map((f: PhotoItem, index: number) => {
              const src = mediaUrl(f.path ?? f.url);
              return (
                <Card
                  key={f.id}
                  className="overflow-hidden border border-[#f5f4eb] dark:border-white/[0.08] transition duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] hover:border-[#e8e6dd] dark:hover:border-amber-500/40 cursor-pointer touch-manipulation"
                  onClick={() => openLightbox(index)}
                >
                  <LazyImage
                    src={src}
                    alt={f.filename ?? 'photo'}
                    objectFit="cover"
                    skeletonHeight={180}
                    style={{ height: 'clamp(120px, 40vw, 180px)', width: '100%' }}
                  />
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
      <ImageLightboxModal
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={imageUrls}
        initialIndex={lightboxIndex}
      />
    </Card>
  );
};
