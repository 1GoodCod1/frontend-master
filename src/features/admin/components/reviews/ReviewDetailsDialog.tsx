import { useTranslation } from 'react-i18next';
import { User, MessageSquare, Paperclip, Eye, EyeOff, Phone, CalendarClock, ExternalLink } from 'lucide-react';
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
import { StarRatingDisplay } from '@/features/admin/components/common/StarRatingDisplay';
import { mediaUrl } from '@/utils/media';
import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';
import { getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { isRecord } from '@/utils/guards';
import { cn } from '@/lib/utils';
import type { ReviewCriteriaDto, ReviewFileDto } from '@/types/reviews';

type WithSlugAndName = { slug?: string | null; name?: string | null } | null | undefined;

function isWithSlugAndName(v: unknown): v is WithSlugAndName {
  if (!isRecord(v)) return v === null || v === undefined;
  const slug = v.slug;
  const name = v.name;
  const slugOk = slug === undefined || slug === null || typeof slug === 'string';
  const nameOk = name === undefined || name === null || typeof name === 'string';
  return slugOk && nameOk;
}

type ReviewDetailsMaster = {
  id?: string | null;
  slug?: string | null;
  avatarUrl?: string | null;
  avatarFile?: { path?: string | null } | null;
  category?: unknown;
  user?: { firstName?: string | null; lastName?: string | null } | null;
} & Record<string, unknown>;

type ReviewDetails = {
  id: string;
  /** Always present on API review rows; used if nested master omits id/slug */
  masterId?: string | null;
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

function pickNonEmptyString(...vals: unknown[]): string | null {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return null;
}

/** Public catalog URL segment: prefer slug, else master UUID from nested master or review.masterId */
function resolveMasterProfileSegment(
  master: ReviewDetailsMaster,
  review: ReviewDetails,
): string | null {
  const r = review as Record<string, unknown>;
  const m = master as Record<string, unknown>;
  return pickNonEmptyString(
    master.slug,
    master.id,
    m.slug,
    m.id,
    review.masterId,
    r.master_id,
  );
}

interface ReviewDetailsDialogProps {
  open: boolean;
  review: ReviewDetails | null;
  onClose: () => void;
  onToggleVisibility: () => void;
}

/** Light: soft slate ring + shadow (no harsh black). Dark: subtle glass ring */
const sectionSurface = cn(
  'rounded-2xl border-0 bg-slate-50/95 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/90',
  'dark:bg-white/[0.03] dark:shadow-none dark:ring-white/[0.09]',
);

const sectionTitleClass = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

/** Inner tile — status / rating: no nested “black box”, soft elevation only */
const summaryTileClass = cn(
  'flex min-h-[6.75rem] min-w-0 flex-col items-center justify-center gap-3 rounded-xl px-3 py-4 text-center',
  'bg-white/95 shadow-sm ring-1 ring-slate-200/80 dark:bg-white/[0.05] dark:ring-white/10',
);

function InfoTile({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: typeof User;
  label: string;
  value: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[4.25rem] gap-3 rounded-xl border-0 bg-white/95 p-3.5 shadow-sm ring-1 ring-slate-200/80',
        'dark:bg-black/20 dark:ring-white/10 sm:min-h-0',
      )}
    >
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15',
          iconClassName,
        )}
      >
        <Icon className="size-[18px]" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className={sectionTitleClass}>{label}</p>
        <p className="mt-1 text-sm font-medium leading-snug text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

function MasterProfileSection({
  master,
  review,
}: {
  master: ReviewDetailsMaster;
  review: ReviewDetails;
}) {
  const { t } = useTranslation();
  const masterName =
    `${master.user?.firstName ?? ''} ${master.user?.lastName ?? ''}`.trim() || '—';
  const segment = resolveMasterProfileSegment(master, review);
  const profileHref = segment ? `/masters/${encodeURIComponent(segment)}` : null;

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
      <Avatar className="size-16 shrink-0 self-center rounded-2xl ring-2 ring-violet-500/35 ring-offset-2 ring-offset-background dark:ring-violet-400/30 dark:ring-offset-[#18171c] sm:self-start">
        {master.avatarFile?.path && (
          <AvatarImage src={mediaUrl(master.avatarFile.path)} className="object-cover" />
        )}
        <AvatarFallback className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-lg font-semibold text-white dark:from-violet-500 dark:to-purple-600">
          {master.user?.firstName?.[0]?.toUpperCase() ?? 'M'}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3 sm:items-stretch sm:text-left">
        <p className="w-full text-center text-base font-semibold text-foreground sm:text-left">{masterName}</p>

        {profileHref ? (
          <a
            href={profileHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex w-full max-w-full items-center justify-center gap-2 rounded-xl border-0 px-4 py-3 text-sm font-semibold shadow-sm ring-1 transition-colors',
              'bg-violet-50/90 text-foreground ring-violet-200/90 hover:bg-violet-100/90 hover:ring-violet-300/80',
              'dark:bg-violet-500/[0.12] dark:ring-violet-400/25 dark:hover:bg-primary/15 dark:hover:ring-primary/40',
            )}
          >
            <ExternalLink className="size-4 shrink-0 text-primary" aria-hidden />
            {t('admin.reviews.openPublicProfile')}
          </a>
        ) : null}

        {isWithSlugAndName(master.category) && !!master.category && (
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            {getTranslatedCategoryName(t, master.category)}
          </p>
        )}
      </div>
    </div>
  );
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

  const ratingNum = review.rating ?? 0;
  const ratingLabel = review.rating != null ? review.rating.toFixed(1) : '0.0';
  const statusUpper = String(review.status ?? '').trim().toUpperCase();
  const isReviewVisible = statusUpper === 'VISIBLE';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[min(40rem,calc(100vw-1.5rem))] gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
          <DialogTitle className="flex items-center gap-3 pr-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25">
              <MessageSquare className="size-[18px]" aria-hidden />
            </div>
            <span className="text-balance">{t('admin.reviews.detailsTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-5 px-5 pb-5 sm:space-y-6 sm:px-6 sm:pb-6">
          {/* Status + rating — two identical tiles, 50/50, always center-aligned inside each */}
          <div className={cn(sectionSurface, 'p-3 sm:p-4')}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className={summaryTileClass}>
                <span className={cn(sectionTitleClass, 'leading-none')}>{t('admin.reviews.status')}</span>
                <StatusChip kind="review" value={String(review.status ?? '')} size="medium" />
              </div>
              <div className={summaryTileClass}>
                <span className={cn(sectionTitleClass, 'leading-none')}>{t('admin.reviews.rating')}</span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <StarRatingDisplay value={ratingNum} size="lg" />
                  <span className="min-w-[2.5ch] text-xl font-bold tabular-nums tracking-tight text-foreground">
                    {ratingLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Client */}
          <section className={cn(sectionSurface, 'overflow-hidden p-4 sm:p-5')}>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t('admin.reviews.clientInfo')}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <InfoTile icon={User} label={t('admin.reviews.nameLabel')} value={review.clientName?.trim() || '—'} />
              <InfoTile
                icon={Phone}
                label={t('admin.reviews.phoneLabel')}
                value={review.clientPhone?.trim() || '—'}
                iconClassName="bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              />
            </div>
          </section>

          {/* Master */}
          {review.master && (
            <section
              className={cn(
                sectionSurface,
                'bg-violet-50/70 p-4 ring-violet-200/70 dark:bg-violet-500/[0.08] dark:ring-violet-500/20 sm:p-5',
              )}
            >
              <h3 className="mb-4 text-sm font-semibold text-foreground">{t('admin.reviews.masterInfo')}</h3>
              <MasterProfileSection master={review.master} review={review} />
            </section>
          )}

          {/* Comment */}
          {review.comment && (
            <section className={cn(sectionSurface, 'p-4 sm:p-5')}>
              <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
                <MessageSquare className="size-[18px] shrink-0 text-primary" aria-hidden />
                <h3 className="text-sm font-semibold text-foreground">{t('admin.reviews.comment')}</h3>
              </div>
              <blockquote className="rounded-lg bg-slate-100/80 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap dark:bg-black/25">
                {review.comment}
              </blockquote>
            </section>
          )}

          {/* Files */}
          {Array.isArray(review.reviewFiles) && review.reviewFiles.length > 0 && (
            <section className={cn(sectionSurface, 'p-4 sm:p-5')}>
              <div className="mb-4 flex items-center justify-center gap-2 sm:justify-start">
                <Paperclip className="size-[18px] shrink-0 text-primary" aria-hidden />
                <h3 className="text-sm font-semibold text-foreground">{t('admin.reviews.attachedFiles')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
                      className="group block overflow-hidden rounded-xl border-0 bg-slate-100/90 text-foreground no-underline shadow-sm ring-1 ring-slate-200/80 transition-colors hover:bg-primary/5 hover:ring-primary/30 dark:bg-black/25 dark:ring-white/10 dark:hover:ring-primary/35"
                    >
                      {isImage ? (
                        <img src={url} alt={f.filename ?? 'image'} className="block h-24 w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center px-2 py-4">
                          <Paperclip className="mb-1 size-8 text-muted-foreground" />
                          <span className="w-full truncate text-center text-xs font-medium">{f.filename ?? 'File'}</span>
                        </div>
                      )}
                      {isImage && f.filename && (
                        <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">{f.filename}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Criteria */}
          {Array.isArray(review.reviewCriteria) && review.reviewCriteria.length > 0 && (
            <section
              className={cn(
                sectionSurface,
                'bg-amber-50/80 p-4 ring-amber-200/80 dark:bg-amber-500/[0.07] dark:ring-amber-500/25 sm:p-5',
              )}
            >
              <h3 className="mb-4 text-sm font-semibold text-foreground">{t('admin.reviews.ratingCriteria')}</h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3">
                {review.reviewCriteria.map((crit: ReviewCriteriaDto) => (
                  <li
                    key={crit.id}
                    className="flex items-center justify-between gap-3 rounded-xl border-0 bg-white/90 px-3 py-2.5 shadow-sm ring-1 ring-slate-200/75 dark:bg-black/15 dark:ring-white/10"
                  >
                    <span className="min-w-0 text-sm text-muted-foreground">{crit.criteria}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <StarRatingDisplay value={crit.rating ?? 0} size="sm" />
                      <span className="text-sm font-semibold tabular-nums">{crit.rating}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Timestamps — equal columns */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className={cn(sectionSurface, 'flex gap-3 p-4 sm:p-5')}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
                <CalendarClock className="size-[18px]" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className={sectionTitleClass}>{t('admin.reviews.created')}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-foreground break-words">
                  {review.createdAt ? formatDateTimeLong(review.createdAt, locale) : '—'}
                </p>
              </div>
            </div>
            <div className={cn(sectionSurface, 'flex gap-3 p-4 sm:p-5')}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
                <CalendarClock className="size-[18px]" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className={sectionTitleClass}>{t('admin.reviews.updated')}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-foreground break-words">
                  {review.updatedAt ? formatDateTimeLong(review.updatedAt, locale) : '—'}
                </p>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="flex flex-col gap-2.5 px-5 pb-5 sm:flex-row sm:flex-wrap sm:justify-end sm:px-6 sm:pb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50 sm:w-auto dark:border-transparent dark:bg-transparent dark:ring-white/15 dark:hover:bg-white/5"
            onClick={onClose}
          >
            {t('admin.audit.close')}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={onToggleVisibility}
            className={cn(
              'w-full min-h-10 shrink-0 font-semibold shadow-md sm:w-auto',
              /* Light: явный тёмный фон — «Скрыть» не теряется на светлом футере */
              isReviewVisible
                ? 'border border-slate-800/20 bg-slate-800 text-white hover:bg-slate-900 hover:text-white focus-visible:ring-slate-400 dark:border-slate-500/30 dark:bg-slate-600 dark:hover:bg-slate-500'
                : 'border border-emerald-800/20 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white dark:bg-emerald-600 dark:hover:bg-emerald-500',
            )}
          >
            {isReviewVisible ? (
              <>
                <EyeOff className="mr-2 size-4 shrink-0" />
                {t('admin.reviews.hideReview')}
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4 shrink-0" />
                {t('admin.reviews.showReview')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
