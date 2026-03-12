import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LazyImage } from '@/components/ui/LazyImage';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';
import { mediaUrl } from '@/utils/media';

type FileItem = {
  id?: string;
  file?: { path?: string; mimetype?: string; filename?: string; size?: number };
};

function isImage(file: { mimetype?: string; path?: string }): boolean {
  if (typeof file?.mimetype === 'string' && file.mimetype.startsWith('image/')) return true;
  return /\.(png|jpe?g|webp|gif)$/i.test(String(file?.path ?? ''));
}

interface LeadFilesGalleryProps {
  files: FileItem[];
  sectionHeader: (icon: React.ReactNode, title: string, subtitle: string) => React.ReactNode;
}

export function LeadFilesGallery({ files, sectionHeader }: LeadFilesGalleryProps) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imageFiles = files.filter((x) => {
    const f = (x as { file?: unknown }).file ?? x;
    return isImage(f as { mimetype?: string; path?: string });
  });
  const otherFiles = files.filter((x) => {
    const f = (x as { file?: unknown }).file ?? x;
    return !isImage(f as { mimetype?: string; path?: string });
  });

  const imageUrls = imageFiles.map((x) => {
    const f = (x as { file?: { path?: string } }).file ?? x;
    return mediaUrl((f as { path?: string }).path);
  }).filter(Boolean);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (files.length === 0) {
    return (
      <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
        {sectionHeader(
          <Paperclip className="size-5" />,
          t('leads.files'),
          t('leads.attachmentsCount', { current: 0, limit: 10 })
        )}
        <CardContent className="px-6 py-6 sm:px-8">
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 dark:bg-white/[0.04] rounded-xl border border-dashed border-slate-200 dark:border-white/[0.12]">
            <Paperclip className="size-8 text-slate-400 dark:text-slate-600 mb-3 opacity-50" />
            <p className="font-medium text-slate-500 dark:text-slate-400">{t('leads.noFilesAttached')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
      {sectionHeader(
        <Paperclip className="size-5" />,
        t('leads.files'),
        t('leads.attachmentsCount', { current: files.length, limit: 10 })
      )}
      <CardContent className="px-6 py-6 sm:px-8">
        <div className="space-y-6">
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              {imageFiles.map((x, index) => {
                const item = x as { file?: { path?: string; filename?: string }; id?: string };
                const f = item?.file ?? item;
                const file = f as { path?: string; filename?: string };
                const url = mediaUrl(file?.path);
                return (
                  <Card
                    key={file?.path ?? item?.id ?? index}
                    className="overflow-hidden border border-slate-200 dark:border-white/[0.08] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] hover:border-amber-500/40 cursor-pointer touch-manipulation"
                    onClick={() => openLightbox(index)}
                  >
                    <LazyImage
                      src={url}
                      alt={file?.filename ?? 'file'}
                      objectFit="cover"
                      skeletonHeight={180}
                      style={{ height: 'clamp(120px, 40vw, 180px)', width: '100%' }}
                    />
                  </Card>
                );
              })}
            </div>
          )}
          {otherFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              {otherFiles.map((x) => {
                const item = x as { file?: { path?: string; filename?: string; size?: number }; id?: string };
                const f = item?.file ?? item;
                const file = f as { path?: string; filename?: string; size?: number };
                const url = mediaUrl(file?.path);
                return (
                  <Card
                    key={file?.path ?? item?.id}
                    className="overflow-hidden border border-slate-200 dark:border-white/[0.08] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] hover:border-amber-500/40 cursor-pointer touch-manipulation"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <div className="flex h-32 sm:h-36 items-center justify-center bg-slate-50 dark:bg-muted/50">
                      <Paperclip className="size-10 text-slate-400 dark:text-muted-foreground opacity-60" />
                    </div>
                    <div className="p-3 bg-white dark:bg-black/40">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100" title={file?.filename}>
                        {file?.filename ?? 'Attachment'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                        {typeof file?.size === 'number' ? `${Math.round(file.size / 1024)} KB` : '—'}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
      <ImageLightboxModal
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={imageUrls}
        initialIndex={lightboxIndex}
      />
    </Card>
  );
}
