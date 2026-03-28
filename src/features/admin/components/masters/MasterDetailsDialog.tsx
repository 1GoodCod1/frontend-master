import { Link as RouterLink } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LazyImage } from '@/components/ui/LazyImage';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { Star, CheckCircle, LayoutGrid, MapPin, Phone, Mail, ExternalLink, Images } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StarRatingDisplay } from '@/features/admin/components/common/StarRatingDisplay';
import { mediaUrl } from '@/utils/media';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';

type MasterDetailsMaster = {
  id: string;
  slug?: string | null;
  avatarFile?: { path?: string | null } | null;
  fullName?: string | null;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  tariffType?: string | null;
  tariff?: string | null;
  plan?: string | null;
  avgRating?: number | null;
  rating?: number | null;
  isFeatured?: boolean | null;
  isVerified?: boolean | null;
  reviewCount?: number | null;
  views?: number | null;
  experienceYears?: number | null;
  description?: string | null;
  user?: {
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarFile?: { path?: string | null } | null;
    isVerified?: boolean | null;
  } | null;
  city?: ({ name?: string | null } & Record<string, unknown>) | null;
  category?: ({ name?: string | null } & Record<string, unknown>) | null;
  photos?: Array<{ id?: string; file?: { path?: string | null } | null }> | null;
} & Record<string, unknown>;

interface MasterDetailsDialogProps {
  open: boolean;
  master: MasterDetailsMaster | null;
  isLoading: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const cardClass =
  'rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]';

export default function MasterDetailsDialog({
  open,
  master,
  isLoading,
  onClose,
  onUpdate,
}: MasterDetailsDialogProps) {
  const { t } = useTranslation();
  if (!master) return null;

  const avatarPath = master.avatarFile?.path || master.user?.avatarFile?.path;
  const avatarSrc = avatarPath ? mediaUrl(avatarPath) : undefined;
  const tariff = master?.tariffType ?? master?.tariff ?? master?.plan ?? 'BASIC';
  const tariffUpper = String(tariff).toUpperCase();
  const rating = master.avgRating ?? master.rating;

  const publicProfilePath = `/masters/${master.slug ?? master.id}`;
  /** Phone lives on `users`; Master has no phone column in DB */
  const contactPhone = master.user?.phone ?? master.phone ?? null;
  const nameLine = [master.user?.firstName, master.user?.lastName].filter(Boolean).join(' ').trim();
  const emailLocal = master.user?.email?.split('@')[0];
  const displayName =
    (master.displayName ?? '').trim() ||
    nameLine ||
    master.fullName ||
    emailLocal ||
    '—';
  const galleryPhotos = (master.photos ?? [])
    .map((p) => {
      const path = p?.file?.path;
      if (!path) return null;
      return { id: p.id ?? path, src: mediaUrl(path) };
    })
    .filter((x): x is { id: string; src: string } => x != null);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">{t('admin.masters.masterDetailsTitle')}</DialogTitle>
          <p className="pr-2 text-sm text-muted-foreground">{t('admin.masters.detailSubtitle')}</p>
        </DialogHeader>

        <DialogBody className="space-y-6 py-5">
          <section className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="size-20 shrink-0 overflow-hidden rounded-xl shadow-md">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="size-full object-cover" />
                ) : (
                  <AvatarPlaceholder role="master" height={80} fillParent />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-lg font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {master.user?.email || master.email || '—'}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Badge
                    variant={tariffUpper === 'BASIC' ? 'secondary' : 'default'}
                    className="font-semibold"
                  >
                    {tariffUpper}
                  </Badge>
                  {(master.user?.isVerified || master.isVerified) && (
                    <Badge className="gap-1 bg-emerald-600 font-semibold text-white hover:bg-emerald-600">
                      <CheckCircle className="size-4" />
                      {t('admin.masters.verifiedBadge')}
                    </Badge>
                  )}
                  {master.isFeatured && (
                    <Badge variant="destructive" className="gap-1 font-semibold">
                      <Star className="size-4" />
                      {t('admin.masters.featuredBadge')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-border/60" />

          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t('admin.masters.publicPageSection')}
            </h3>
            <p className="text-xs text-muted-foreground/90">{t('admin.masters.publicPageHelp')}</p>
            <RouterLink
              to={publicProfilePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-500/20 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/20"
            >
              <ExternalLink className="size-4 shrink-0" aria-hidden />
              {t('admin.masters.openPublicProfile')}
            </RouterLink>
          </section>

          {galleryPhotos.length > 0 && (
            <>
              <Separator className="bg-border/60" />
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Images className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {t('admin.masters.gallerySection')}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground/90">{t('admin.masters.galleryHelp')}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {galleryPhotos.map((photo, index) => (
                    <a
                      key={photo.id}
                      href={photo.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-xl border border-slate-200/90 bg-muted/30 shadow-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-amber-500/50 dark:border-white/[0.12]"
                    >
                      <LazyImage
                        src={photo.src}
                        alt={t('admin.masters.galleryPhotoAlt', { n: index + 1 })}
                        objectFit="cover"
                        skeletonHeight={120}
                        className="aspect-[4/3] w-full transition-transform duration-200 group-hover:scale-[1.02]"
                        style={{ height: 'clamp(96px, 22vw, 140px)', width: '100%' }}
                      />
                    </a>
                  ))}
                </div>
              </section>
            </>
          )}

          <Separator className="bg-border/60" />

          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t('admin.masters.categoryContactSection')}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {master.category ? (
                <div className={cardClass}>
                  <div className="mb-2 flex items-center gap-2">
                    <LayoutGrid className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-semibold text-foreground">{t('admin.masters.category')}</span>
                  </div>
                  <p className="pl-6 text-sm text-muted-foreground">
                    {getTranslatedCategoryName(t, master.category)}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[72px] items-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-sm text-muted-foreground">
                  {t('admin.masters.emptyCategory')}
                </div>
              )}
              {master.city ? (
                <div className={cardClass}>
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-semibold text-foreground">{t('admin.masters.city')}</span>
                  </div>
                  <p className="pl-6 text-sm text-muted-foreground">
                    {getTranslatedCityName(t, master.city)}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[72px] items-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-sm text-muted-foreground">
                  {t('admin.masters.emptyCity')}
                </div>
              )}
              {contactPhone ? (
                <div className={cardClass}>
                  <div className="mb-2 flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-semibold text-foreground">{t('admin.reviews.phoneLabel')}</span>
                  </div>
                  <p className="pl-6 text-sm text-muted-foreground">{contactPhone}</p>
                </div>
              ) : (
                <div className="flex min-h-[72px] items-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-sm text-muted-foreground">
                  {t('admin.masters.emptyPhone')}
                </div>
              )}
              {(master.user?.email || master.email) ? (
                <div className={cardClass}>
                  <div className="mb-2 flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-semibold text-foreground">{t('admin.users.email')}</span>
                  </div>
                  <p className="break-all pl-6 text-sm text-muted-foreground">
                    {master.user?.email || master.email}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-[72px] items-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-sm text-muted-foreground">
                  {t('admin.masters.emptyEmail')}
                </div>
              )}
            </div>
          </section>

          <Separator className="bg-border/60" />

          <section className="space-y-3">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {t('admin.masters.statisticsSection')}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground/90">{t('admin.masters.statisticsHelp')}</p>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-stone-50/60 p-4 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">{t('admin.masters.rating')}</p>
                  {rating != null ? (
                    <div className="flex items-center gap-1">
                      <StarRatingDisplay value={Number(rating)} size="sm" />
                      <span className="font-semibold">{Number(rating).toFixed(1)}</span>
                    </div>
                  ) : (
                    <p className="font-medium">{t('admin.masters.noReviews')}</p>
                  )}
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">{t('admin.masters.reviewsLabel')}</p>
                  <p className="font-semibold">{master.reviewCount ?? 0}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-muted-foreground">{t('admin.masters.views')}</p>
                  <p className="font-semibold">{(master.views ?? 0).toLocaleString()}</p>
                </div>
                {master.experienceYears !== undefined && (
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">{t('admin.users.experienceLabel')}</p>
                    <p className="font-semibold">
                      {master.experienceYears}{' '}
                      {master.experienceYears === 1
                        ? t('admin.masters.experienceYear')
                        : t('admin.masters.experienceYears')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {master.description && (
            <>
              <Separator className="bg-border/60" />
              <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t('admin.masters.descriptionSection')}
                </h3>
                <div className="rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 text-sm text-muted-foreground shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
                  <p className="whitespace-pre-wrap">{master.description}</p>
                </div>
              </section>
            </>
          )}
        </DialogBody>

        <DialogFooter className="gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-w-[7rem] border-amber-500/50 bg-transparent text-amber-800 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-950/40"
          >
            {t('admin.masters.closeDialog')}
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={onUpdate}
            className="min-w-[7rem] border-0 bg-amber-600 text-white shadow-md transition hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            {isLoading ? t('admin.masters.updating') : t('admin.masters.updateMaster')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
