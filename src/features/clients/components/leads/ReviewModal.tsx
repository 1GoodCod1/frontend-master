import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Paperclip, Trash2, MessageSquarePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewModalProps {
  isOpen: boolean;
  masterName: string;
  rating: number;
  comment: string;
  photos: File[];
  isLoading: boolean;
  onClose: () => void;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onPhotosChange: (photos: File[]) => void;
  onSubmit: () => void;
}

const RATING_LABELS = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'];

export default function ReviewModal({
  isOpen,
  masterName,
  rating,
  comment,
  photos,
  isLoading,
  onClose,
  onRatingChange,
  onCommentChange,
  onPhotosChange,
  onSubmit,
}: ReviewModalProps) {
  const { t } = useTranslation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    const left = 5 - photos.length;
    if (left <= 0) return;
    onPhotosChange([...photos, ...list.slice(0, left)]);
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  // Memoize blob URLs for photo previews and revoke on cleanup
  const photoUrls = useMemo(
    () => photos.map((f) => URL.createObjectURL(f)),
    [photos],
  );
  useEffect(() => () => {
    photoUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [photoUrls]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <MessageSquarePlus className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold leading-snug">{t('reviews.leaveReview')}</div>
              <div className="text-sm text-muted-foreground font-normal truncate">{masterName}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-col gap-6">
            {/* Rating */}
            <div>
              <Label className="mb-3 block text-sm font-semibold">
                {t('reviews.rating')}
              </Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="rounded-lg p-1 transition duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
                      onClick={() => onRatingChange(v)}
                      aria-label={`${v} star${v > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={cn(
                          'size-9 transition duration-150',
                          v <= rating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'text-muted-foreground/30 hover:text-amber-300',
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400 animate-in fade-in duration-200">
                    {RATING_LABELS[rating]}
                  </p>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="review-comment" className="text-sm font-semibold">
                {t('reviews.comment')}
              </Label>
              <Textarea
                id="review-comment"
                rows={4}
                placeholder={t('reviews.commentPlaceholder')}
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                className="resize-none"
              />
            </div>

            {/* Photos */}
            <div>
              <input
                id="review-photos"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={photos.length >= 5}
                className={cn(
                  'gap-2 transition duration-150',
                  photos.length < 5
                    ? 'border-border text-muted-foreground hover:border-amber-500/50 hover:bg-amber-50/50 hover:text-amber-700 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-400'
                    : 'opacity-50',
                )}
                asChild={photos.length < 5}
              >
                {photos.length < 5 ? (
                  <label htmlFor="review-photos" className="cursor-pointer">
                    <Paperclip className="size-4" />
                    {t('reviews.addPhotos')} ({photos.length}/5)
                  </label>
                ) : (
                  <span>
                    <Paperclip className="size-4" />
                    {t('reviews.addPhotos')} (5/5)
                  </span>
                )}
              </Button>
              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photos.map((_f, i) => (
                    <div
                      key={i}
                      className="group relative size-16 overflow-hidden rounded-xl border-2 border-border shadow-sm"
                    >
                      <img
                        src={photoUrls[i]}
                        alt=""
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || rating === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t('reviews.submit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
