import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, Trash2 } from 'lucide-react';
import { FileDto } from '@/types';
import { mediaUrl } from '@/utils/media';
import { LazyImage } from '@/components/ui/LazyImage';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';

export interface MasterGalleryGridProps {
  items: FileDto[];
  avatarFileId?: string | null;
  onSetAvatar?: (fileId: string) => void;
  onRemove?: (fileId: string) => void;
  busyId?: string | null;
  max?: number;
  /** Gallery style: lightbox on click, grid like MasterDetailsPage, no filename. When true, onSetAvatar/avatarFileId are ignored. */
  variant?: 'default' | 'gallery';
}

export function MasterGalleryGrid({
  items,
  avatarFileId = null,
  onSetAvatar,
  onRemove,
  busyId,
  max = 15,
  variant = 'default',
}: MasterGalleryGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const list = Array.isArray(items) ? items.slice(0, max) : [];
  const imageUrls = list.map((f) => {
    const pathOrUrl = (f as FileDto & { path?: string }).path ?? (f as FileDto & { url?: string }).url;
    return pathOrUrl ? (pathOrUrl.startsWith('http') ? pathOrUrl : mediaUrl(pathOrUrl)) : '';
  }).filter(Boolean);

  const isGalleryVariant = variant === 'gallery';
  const showSetAvatar = Boolean(onSetAvatar);
  const showRemove = Boolean(onRemove);
  const showLightbox = isGalleryVariant;

  const openLightbox = (index: number) => {
    if (!showLightbox) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <TooltipProvider>
      <div
        className={
          isGalleryVariant
            ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }
      >
        {list.map((f, index) => {
          const isAvatar = avatarFileId && f.id === avatarFileId;
          const isBusy = busyId === f.id;
          const pathOrUrl = (f as FileDto & { path?: string }).path ?? (f as FileDto & { url?: string }).url;
          const url = pathOrUrl ? (pathOrUrl.startsWith('http') ? pathOrUrl : mediaUrl(pathOrUrl)) : '';

          return (
            <Card
              key={f.id}
              className={
                isGalleryVariant
                  ? 'overflow-hidden border border-[#f5f4eb] dark:border-white/[0.08] transition duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] hover:border-[#e8e6dd] dark:hover:border-amber-500/40 cursor-pointer touch-manipulation'
                  : 'overflow-hidden border-border'
              }
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (isBusy) return;
                  if (showLightbox) openLightbox(index);
                  else window.open(url, '_blank');
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isBusy) {
                    e.preventDefault();
                    if (showLightbox) openLightbox(index);
                    else window.open(url, '_blank');
                  }
                }}
                className={`relative ${isBusy ? 'pointer-events-none cursor-default' : ''}`}
              >
                {isGalleryVariant ? (
                  <LazyImage
                    src={url}
                    alt={f.filename ?? 'photo'}
                    objectFit="cover"
                    skeletonHeight={180}
                    style={{ height: 'clamp(120px, 40vw, 180px)', width: '100%' }}
                  />
                ) : (
                  <img src={url} alt={f.filename} className="h-44 w-full object-cover" />
                )}

                {isAvatar && (
                  <div className="absolute left-2 top-2">
                    <Badge variant="default" className="bg-emerald-600 text-xs">
                      Avatar
                    </Badge>
                  </div>
                )}

                {(showSetAvatar || showRemove) && (
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    {showSetAvatar && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            className="size-8 border-0 bg-emerald-500/90 dark:bg-emerald-600/90 backdrop-blur-sm shadow-lg ring-1 ring-emerald-600/30 dark:ring-emerald-400/30 text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:scale-110 transition duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onSetAvatar?.(f.id);
                            }}
                            disabled={isBusy}
                          >
                            <CheckCircle className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Set as avatar</TooltipContent>
                      </Tooltip>
                    )}
                    {showRemove && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            className="size-8 border-0 bg-red-500/90 dark:bg-red-600/90 backdrop-blur-sm shadow-lg ring-1 ring-red-600/30 dark:ring-red-400/30 text-white hover:bg-red-600 dark:hover:bg-red-500 hover:scale-110 transition duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onRemove?.(f.id);
                            }}
                            disabled={isBusy}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove from gallery</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>

              {!isGalleryVariant && (
                <CardContent className="space-y-0.5 py-3">
                  <p className="truncate text-sm font-bold" title={f.filename}>
                    {f.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {f.size ? `${Math.round(f.size / 1024)} KB` : '—'}
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
      {showLightbox && imageUrls.length > 0 && (
        <ImageLightboxModal
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          images={imageUrls}
          initialIndex={lightboxIndex}
        />
      )}
    </TooltipProvider>
  );
}
