import { useTranslation } from 'react-i18next';
import { User, MessageSquare, Paperclip, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusChip } from '@/components/ui/StatusChip';
import { StarRatingDisplay } from '@/components/admin/common/StarRatingDisplay';
import { mediaUrl } from '@/utils/media';
import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';
import type { ReviewCriteriaDto, ReviewFileDto } from '@/types/reviews';

type WithSlugAndName = { slug?: string | null; name?: string | null } | null | undefined;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isWithSlugAndName(v: unknown): v is WithSlugAndName {
  if (!isRecord(v)) return v === null || v === undefined;
  const slug = v.slug;
  const name = v.name;
  const slugOk = slug === undefined || slug === null || typeof slug === 'string';
  const nameOk = name === undefined || name === null || typeof name === 'string';
  return slugOk && nameOk;
}

type ReviewDetailsMaster = {
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  category?: unknown;
  user?: { firstName?: string | null; lastName?: string | null } | null;
} & Record<string, unknown>;

type ReviewDetails = {
  id: string;
  status?: string | null;
  rating?: number | null;
  clientName?: string | null;
  clientPhone?: string | null;
  comment?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  reviewFiles?: ReviewFileDto[] | null;
  reviewCriteria?: ReviewCriteriaDto[] | null;
  master?: ReviewDetailsMaster | null;
} & Record<string, unknown>;


interface ReviewDetailsDialogProps {
  open: boolean;
  review: ReviewDetails | null;
  onClose: () => void;
  onToggleVisibility: () => void;
}

export default function ReviewDetailsDialog({
  open,
  review,
  onClose,
  onToggleVisibility,
}: ReviewDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-4" />
            </div>
            Review Details
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
            <StatusChip kind="review" value={String(review.status ?? '')} />
            <div className="flex items-center gap-2">
              <StarRatingDisplay value={review.rating ?? 0} size="lg" />
              <span className="text-lg font-bold text-foreground">
                {review.rating?.toFixed(1) ?? '0.0'}
              </span>
            </div>
          </div>

          <section className="p-4 rounded-lg border border-primary/20 bg-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
            <h3 className="text-sm font-bold text-foreground mb-3">Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="size-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Name</span>
                </div>
                <p className="text-sm font-medium ml-7">{review.clientName ?? '—'}</p>
              </div>
              {review.clientPhone && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="size-5 text-primary" />
                    <span className="text-xs text-muted-foreground">Phone</span>
                  </div>
                  <p className="text-sm font-medium ml-7">{review.clientPhone}</p>
                </div>
              )}
            </div>
          </section>

          {review.master && (
            <section className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150">
              <h3 className="text-sm font-bold text-foreground mb-3">Master Information</h3>
              <div className="flex items-center gap-4">
                <Avatar className="size-14 rounded-lg border-2 border-border bg-purple-600">
                  {review.master.avatarFile?.path && (
                    <AvatarImage src={mediaUrl(review.master.avatarFile.path)} className="object-cover" />
                  )}
                  <AvatarFallback className="rounded-lg text-lg font-semibold text-white bg-transparent">
                    {review.master.user?.firstName?.[0]?.toUpperCase() ?? 'M'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {`${review.master.user?.firstName ?? ''} ${review.master.user?.lastName ?? ''}`.trim() || '—'}
                  </p>
                  {isWithSlugAndName(review.master.category) && !!review.master.category && (
                    <p className="text-xs text-muted-foreground">
                      {getTranslatedCategoryName(t, review.master.category)}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {review.comment && (
            <section className="p-4 rounded-lg border border-border bg-muted/30 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="size-5 text-primary" />
                <span className="text-sm font-bold text-foreground">Comment</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed ml-7">
                {review.comment}
              </p>
            </section>
          )}

          {Array.isArray(review.reviewFiles) && review.reviewFiles.length > 0 && (
            <section className="p-4 rounded-lg border border-border bg-muted/30 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="size-5 text-primary" />
                <span className="text-sm font-bold text-foreground">Attached files</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {review.reviewFiles.map((rf: ReviewFileDto) => {
                  const f = rf?.file;
                  if (!f?.path) return null;
                  const url = mediaUrl(f.path);
                  const isImage = String(f.mimetype || '').startsWith('image/');
                  return (
                    <a
                      key={rf.id ?? f.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden border border-border bg-muted/50 hover:border-primary hover:bg-primary/10 transition-colors text-foreground no-underline"
                    >
                      {isImage ? (
                        <img src={url} alt={f.filename ?? 'image'} className="w-full h-24 object-cover block" />
                      ) : (
                        <div className="py-4 px-2 flex flex-col items-center justify-center">
                          <Paperclip className="size-8 text-muted-foreground mb-1" />
                          <span className="text-xs font-medium truncate w-full text-center">{f.filename ?? 'File'}</span>
                        </div>
                      )}
                      {isImage && f.filename && (
                        <span className="block px-2 py-1 text-xs truncate">{f.filename}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {Array.isArray(review.reviewCriteria) && review.reviewCriteria.length > 0 && (
            <section className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
              <h3 className="text-sm font-bold text-foreground mb-3">Rating Criteria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {review.reviewCriteria.map((crit: ReviewCriteriaDto) => (
                  <div key={crit.id} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{crit.criteria}</span>
                    <div className="flex items-center gap-1">
                      <StarRatingDisplay value={crit.rating ?? 0} size="sm" />
                      <span className="text-sm font-semibold">{crit.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300">
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm font-semibold">
                {review.createdAt ? formatDateTimeLong(review.createdAt, locale) : '—'}
              </p>
            </div>
            {review.updatedAt && (
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Updated</p>
                <p className="text-sm font-semibold">{formatDateTimeLong(review.updatedAt, locale)}</p>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            onClick={onToggleVisibility}
            className={
              review?.status === 'VISIBLE'
                ? 'bg-muted-foreground hover:bg-muted-foreground/90'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }
          >
            {review?.status === 'VISIBLE' ? (
              <>
                <EyeOff className="size-4 mr-2" />
                Hide Review
              </>
            ) : (
              <>
                <Eye className="size-4 mr-2" />
                Show Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
