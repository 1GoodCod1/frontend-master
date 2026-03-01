import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/app/hooks';
import { useMastersByIdQuery } from '@/features/masters/mastersApi';
import { usePromotionForMasterQuery } from '@/features/promotions/promotionsApi';
import { useReviewsForMasterQuery, useReviewsCanCreateQuery } from '@/features/reviews/reviewsApi';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { useMastersPhotosByIdQuery } from '@/features/masters/masterPhotosApi';
import { useLeadsActiveToMasterQuery } from '@/features/leads/leadsApi';
import { useMasterFavorites } from '@/hooks/masters/useMasterFavorites';
import { useReviewSubmission } from '@/hooks/reviews/useReviewSubmission';
import { useLeadSubmission } from '@/hooks/leads/useLeadSubmission';
import { ErrorState } from '@/components/common/States';
import { DetailSkeleton } from '@/components/common/Skeletons';
import { MasterProfileHero } from '@/components/masters/MasterProfileHero';
import { MasterDetailsInfo } from '@/components/masters/MasterDetailsInfo';
import { MasterDetailsServices } from '@/components/masters/MasterDetailsServices';
import { MasterDetailsGallery } from '@/components/masters/MasterDetailsGallery';
import { MasterDetailsReviews } from '@/components/masters/MasterDetailsReviews';
import { MasterDetailsLeadForm } from '@/components/masters/MasterDetailsLeadForm';
import { SimilarMasters } from '@/components/home/recommendations/SimilarMasters';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { Link as RouterLink } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

function getCurrentUserMasterId(me: unknown): string | undefined {
  if (!me || typeof me !== 'object') return undefined;
  const rec = me as {
    masterProfile?: { id?: unknown } | null;
    master?: { id?: unknown } | null;
  };
  const id1 = rec.masterProfile?.id;
  if (typeof id1 === 'string') return id1;
  const id2 = rec.master?.id;
  if (typeof id2 === 'string') return id2;
  return undefined;
}

export default function MasterDetailsPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const slugOrId = slug ?? '';
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const me = useAppSelector((s) => s.auth.me);
  const isClient = isAuthed && role === 'CLIENT';

  const masterQuery = useMastersByIdQuery(
    { id: slugOrId },
    { skip: !slugOrId, refetchOnFocus: true }
  );
  const galleryQuery = useMastersPhotosByIdQuery(
    { id: slugOrId, limit: 15 },
    { skip: !slugOrId },
  );

  const m = masterQuery.data;
  const masterId = m?.id;
  const currentUserMasterId = getCurrentUserMasterId(me);
  const isOwnProfile = Boolean(isAuthed && masterId && currentUserMasterId === masterId);

  const availabilityStatus = m?.availabilityStatus || 'AVAILABLE';
  const currentActiveLeads = m?.currentActiveLeads || 0;
  const maxActiveLeads = m?.maxActiveLeads || 5;
  const isMasterAvailable = availabilityStatus === 'AVAILABLE' && currentActiveLeads < maxActiveLeads;

  const reviewsQuery = useReviewsForMasterQuery(
    { masterId: masterId ?? '', status: 'VISIBLE' },
    { skip: !masterId }
  );
  const canCreateReviewQuery = useReviewsCanCreateQuery(masterId ?? '', { skip: !isClient || !masterId });

  const favorites = useMasterFavorites(masterId, isClient);
  const reviewSubmission = useReviewSubmission(masterId);
  const leadSubmission = useLeadSubmission(masterId, isAuthed, role);

  const { data: activeLeadData } = useLeadsActiveToMasterQuery(
    { masterId: masterId ?? '', userId: me?.id },
    { skip: !isClient || !masterId || !me?.id },
  );
  const { data: promotionsData } = usePromotionForMasterQuery(
    { masterId: masterId ?? '' },
    { skip: !masterId, refetchOnMountOrArgChange: true },
  );
  const promotions = useMemo(() => {
    if (!Array.isArray(promotionsData) || promotionsData.length === 0) return [];
    return promotionsData.map((p) => ({
      discount: p.discount,
      serviceTitle: p.serviceTitle ?? null,
    }));
  }, [promotionsData]);

  const rawActiveLead = activeLeadData;
  const hasActiveLead = Boolean(
    rawActiveLead &&
    typeof rawActiveLead === 'object' &&
    rawActiveLead !== null &&
    'id' in (rawActiveLead as Record<string, unknown>),
  );

  useEffect(() => {
    if (searchParams.get('review') !== '1' || !masterId) return;
    if (isClient && canCreateReviewQuery.isLoading) return;
    const timer = setTimeout(() => {
      reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const next = new URLSearchParams(searchParams);
      next.delete('review');
      setSearchParams(next, { replace: true });
    }, 200);
    return () => clearTimeout(timer);
  }, [searchParams, masterId, isClient, canCreateReviewQuery.isLoading, setSearchParams]);

  if (!slugOrId) return <ErrorState error={t('masterDetails.invalidId')} />;
  if (masterQuery.isError) return <ErrorState error={masterQuery.error} onRetry={masterQuery.refetch} />;

  const hasCachedData = masterQuery.data && !masterQuery.isLoading;
  const isLoadingWithoutCache = masterQuery.isLoading && !hasCachedData;
  if (isLoadingWithoutCache) return <DetailSkeleton />;
  if (!m) return <ErrorState error={t('masterDetails.notFound')} onRetry={masterQuery.refetch} />;

  const fullName = [m?.user?.firstName, m?.user?.lastName].filter(Boolean).join(' ').trim();
  const title = fullName || m?.displayName || m?.name || t('masterDetails.masterLabel');
  const photos = galleryQuery.data?.items?.slice(0, 15) ?? [];
  const rating =
    typeof m?.rating === 'number'
      ? m.rating
      : typeof m?.avgRating === 'number'
        ? m.avgRating
        : undefined;
  const avatarUrl = m?.avatarUrl ?? m?.avatarFile?.path ?? undefined;
  const isOnline = typeof m?.isOnline === 'boolean' ? m.isOnline : undefined;
  const lastActivityAt = m?.lastActivityAt ?? undefined;
  const services = Array.isArray(m?.services) ? m.services : undefined;
  const description = typeof m?.description === 'string' ? m.description : '';
  const tariff = typeof m?.tariff === 'string' ? m.tariff : undefined;
  const isVip = m?.vip === true;
  const experienceYears = typeof m?.experienceYears === 'number' ? m.experienceYears : undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <MasterProfileHero
        title={title}
        avatarUrl={avatarUrl}
        categoryName={m?.category ? getTranslatedCategoryName(t, m.category) : undefined}
        cityName={m?.city ? getTranslatedCityName(t, m.city) : undefined}
        rating={rating}
        isVerified={Boolean(m?.user?.isVerified)}
        isOnline={isOnline}
        lastActivityAt={lastActivityAt}
        isFavorite={favorites.isFavorite}
        onToggleFavorite={favorites.toggleFavorite}
        favoriteLoading={favorites.isLoading}
        favoriteAnimation={favorites.favoriteAnimation}
        isClient={isClient}
        isOwnProfile={isOwnProfile}
        hasActiveLead={hasActiveLead}
        availabilityStatus={availabilityStatus}
        isMasterAvailable={isMasterAvailable}
        currentActiveLeads={currentActiveLeads}
        maxActiveLeads={maxActiveLeads}
      />

      <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          <div className={`space-y-6 ${isOwnProfile || !m?.user?.isVerified ? 'md:col-span-12' : 'md:col-span-7'}`}>
            <MasterDetailsInfo
              description={description}
              isVerified={Boolean(m?.user?.isVerified)}
              tariff={tariff}
              isVip={isVip}
              showContactInfo={false}
              experienceYears={experienceYears}
            />

            {m?.user?.isVerified && services && services.length > 0 ? (
              <MasterDetailsServices
                services={services}
                promotions={promotions}
              />
            ) : !m?.user?.isVerified ? (
              <Alert className="rounded-xl border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
                <ShieldCheck className="size-5 text-amber-600 dark:text-amber-500" />
                <AlertTitle className="font-bold text-foreground">
                  {t('verificationBanner.title')}
                </AlertTitle>
                <AlertDescription className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex-1">
                    {isOwnProfile
                      ? t('verificationBanner.servicesPromotionsBlocked')
                      : t('verificationBanner.servicesPromotionsBlockedPublic')}
                  </span>
                  {isOwnProfile && (
                    <Button asChild size="sm" className="shrink-0 bg-amber-600 font-semibold hover:bg-amber-700">
                      <RouterLink to="/dashboard/verification">
                        {t('verificationBanner.verifyNow')}
                      </RouterLink>
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ) : null}

            <MasterDetailsGallery
              photos={photos}
              isLoading={galleryQuery.isLoading}
              isError={galleryQuery.isError}
              error={galleryQuery.error}
              onRetry={galleryQuery.refetch}
            />

            {masterId && (
              <PortfolioSection masterId={masterId} />
            )}

            {masterId && (
              <SimilarMasters masterId={masterId} limit={4} />
            )}

            <div ref={reviewsSectionRef}>
              <MasterDetailsReviews
                reviews={reviewsQuery.data ?? []}
                isLoading={reviewsQuery.isLoading}
                isError={reviewsQuery.isError}
                error={reviewsQuery.error}
                onRetry={reviewsQuery.refetch}
                isClient={isClient}
                canCreateReview={canCreateReviewQuery.data ?? undefined}
                reviewSubmission={reviewSubmission}
              />
            </div>
          </div>

          {!isOwnProfile && m?.user?.isVerified && (
            <div id="lead-form" className="md:col-span-5">
              <div className="md:sticky md:top-24 space-y-6">
                <MasterDetailsLeadForm
                  isAuthed={isAuthed}
                  role={role}
                  masterId={masterId ?? ''}
                  fullName={fullName}
                  leadSubmission={leadSubmission}
                  isMasterAvailable={isMasterAvailable}
                  availabilityStatus={availabilityStatus}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
