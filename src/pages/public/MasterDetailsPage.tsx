import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useMastersByIdQuery } from '@/features/masters/mastersApi';
import { usePromotionForMasterQuery } from '@/features/promotions/promotionsApi';
import { useReviewsForMasterQuery, useReviewsCanCreateQuery } from '@/features/reviews/reviewsApi';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { useMastersPhotosByIdQuery } from '@/features/masters/masterPhotosApi';
import { useLeadsActiveToMasterQuery } from '@/features/leads/leadsApi';
import { useMasterFavorites } from '@/hooks/masters/useMasterFavorites';
import { useReviewSubmission } from '@/hooks/reviews/useReviewSubmission';
import { useRequestSubmission } from '@/hooks/requests';
import { SEOHead } from '@/components/seo/SEOHead';
import { ErrorState } from '@/components/common/States';
import { DetailSkeleton } from '@/components/common/Skeletons';
import { MasterProfileHero } from '@/features/masters/components/MasterProfileHero';
import { MasterDetailsInfo } from '@/features/masters/components/MasterDetailsInfo';
import { MasterDetailsServices } from '@/features/masters/components/MasterDetailsServices';
import { MasterDetailsGallery } from '@/features/masters/components/MasterDetailsGallery';
import { MasterDetailsReviews } from '@/features/masters/components/MasterDetailsReviews';
import { MasterDetailsLeadForm } from '@/features/masters/components/MasterDetailsLeadForm';
import { SimilarMasters } from '@/components/home/recommendations/SimilarMasters';
import { PortfolioSection } from '@/features/portfolio/components/PortfolioSection';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { ShieldCheck, MapPin, Briefcase, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { trackRecentView } from '@/utils/tracking';
import { hasRecentViewsConsent } from '@/features/cookie-consent/storage';
import { USER_ROLE } from '@/constants/roles';
import { AVAILABILITY_STATUS } from '@/constants/availabilityStatus';

type TabId = 'about' | 'services' | 'gallery' | 'reviews';

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
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const { slug } = useParams<{ slug: string }>();
  const slugOrId = slug ?? '';
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>('about');

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const me = useAppSelector((s) => s.auth.me);
  const isClient = isAuthed && role === USER_ROLE.CLIENT;

  const masterQuery = useMastersByIdQuery(
    { id: slugOrId },
    { skip: !slugOrId, refetchOnFocus: true, refetchOnMountOrArgChange: 30 }
  );
  const galleryQuery = useMastersPhotosByIdQuery(
    { id: slugOrId, limit: 15 },
    { skip: !slugOrId },
  );

  const m = masterQuery.data;
  const masterId = m?.id;
  const currentUserMasterId = getCurrentUserMasterId(me);
  const isOwnProfile = Boolean(isAuthed && masterId && currentUserMasterId === masterId);

  const availabilityStatus = m?.availabilityStatus || AVAILABILITY_STATUS.AVAILABLE;
  const currentActiveLeads = m?.currentActiveLeads || 0;
  const maxActiveLeads = m?.maxActiveLeads || 5;
  const isMasterAvailable =
    availabilityStatus === AVAILABILITY_STATUS.AVAILABLE && currentActiveLeads < maxActiveLeads;

  const reviewsQuery = useReviewsForMasterQuery(
    { masterId: masterId ?? '', status: 'VISIBLE' },
    { skip: !masterId }
  );
  const canCreateReviewQuery = useReviewsCanCreateQuery(masterId ?? '', {
    skip: !isClient || !masterId,
    refetchOnMountOrArgChange: true, // Always re-check after lead gets CLOSED
  });

  const favorites = useMasterFavorites(masterId, isClient);
  const reviewSubmission = useReviewSubmission(masterId, canCreateReviewQuery.data?.leadId);
  const leadSubmission = useRequestSubmission(masterId, isAuthed, role);

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
    if (masterId && hasRecentViewsConsent()) trackRecentView(masterId);
  }, [masterId]);

  useEffect(() => {
    if (searchParams.get('review') !== '1' || !masterId) return;
    if (isClient && canCreateReviewQuery.isLoading) return;
    const timer = setTimeout(() => {
      setActiveTab('reviews');
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
  const avatarUrl =
    m?.avatarUrl ?? m?.avatarFile?.path ?? m?.user?.avatarFile?.path ?? undefined;
  const isOnline = typeof m?.isOnline === 'boolean' ? m.isOnline : undefined;
  const lastActivityAt = m?.lastActivityAt ?? undefined;
  const services = Array.isArray(m?.services) ? m.services : undefined;
  const description = typeof m?.description === 'string' ? m.description : '';
  const tariff = typeof m?.tariff === 'string' ? m.tariff : undefined;
  const isVip = m?.vip === true;
  const experienceYears = typeof m?.experienceYears === 'number' ? m.experienceYears : undefined;
  const reviewsCount = m?.totalReviews ?? reviewsQuery.data?.length ?? 0;
  const completedProjects = m?.leadsCount ?? 0;
  const responseRate =
    typeof m?.responseRate === 'number' ? m.responseRate : 100;

  const tabLabels: Record<TabId, string> = {
    about: `📋 ${t('masterDetails.about')}`,
    services: `📋 ${t('masterDetails.servicesTab', 'Services')}`,
    gallery: `📸 ${t('masterDetails.gallery')}`,
    reviews: `💬 ${t('masterDetails.reviews')}`,
  };

  const cardCls = 'bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08] rounded-3xl shadow-sm transition-colors duration-300';

  const seoDescription =
    description?.slice(0, 160) ||
    t('masterDetails.becomeClientSubtitle');
  const categoryName = m?.category ? getTranslatedCategoryName(t, m.category) : '';
  const cityName = m?.city ? getTranslatedCityName(t, m.city) : '';
  const serviceKeywordParts =
    services
      ?.map((s) => (s && typeof s.title === 'string' ? s.title.trim() : ''))
      .filter(Boolean)
      .slice(0, 8) ?? [];
  const seoKeywords = [
    fullName,
    categoryName,
    cityName,
    ...serviceKeywordParts,
    t('masterDetails.seoKeywordsSuffix'),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <SEOHead
        title={title}
        description={seoDescription}
        keywords={seoKeywords}
        ogType="profile"
        ogImage={avatarUrl?.startsWith('http') ? avatarUrl : undefined}
      />
      <div className="faber-page-enter">
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
        experienceYears={experienceYears}
        reviewsCount={reviewsCount}
        completedProjects={completedProjects}
        responseRate={responseRate}
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column — tabs + content */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Tabs — Figma: active orange+white, inactive white+light grey border+dark grey text */}
            <div className="bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-2 flex gap-1.5 flex-wrap shadow-sm">
              {(['about', 'services', 'gallery', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex-1 min-w-[100px] py-2.5 rounded-xl text-sm font-medium transition',
                    activeTab === tab
                      ? 'bg-[hsl(var(--button-bg))] dark:bg-[#E97525] text-white shadow-sm'
                      : 'bg-transparent text-gray-700 dark:text-gray-400 border border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                  )}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>

            {/* ABOUT tab */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <MasterDetailsInfo
                  description={description}
                  isVerified={Boolean(m?.user?.isVerified)}
                  tariff={tariff}
                  isVip={isVip}
                  showContactInfo={false}
                  experienceYears={experienceYears}
                  masterId={masterId}
                  services={m?.user?.isVerified ? services : undefined}
                  onNavigateToServices={() => setActiveTab('services')}
                />

                {masterId && <PortfolioSection masterId={masterId} />}
              </div>
            )}

            {/* SERVICES tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                {services && services.length > 0 ? (
                  <MasterDetailsServices
                    services={services}
                    promotions={promotions}
                  />
                ) : !m?.user?.isVerified && isOwnProfile ? (
                  <Alert className="rounded-xl border-primary/30 bg-primary/5">
                    <ShieldCheck className="size-5 text-primary" />
                    <AlertTitle className="font-bold text-foreground">
                      {t('verificationBanner.title')}
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      {t('verificationBanner.servicesPromotionsBlocked')}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className={cn(cardCls, 'p-8')}>
                    <p className="text-muted-foreground">{t('masterDetails.noServices')}</p>
                  </div>
                )}
              </div>
            )}

            {/* GALLERY tab */}
            {activeTab === 'gallery' && (
              <MasterDetailsGallery
                photos={photos}
                isLoading={galleryQuery.isLoading}
                isError={galleryQuery.isError}
                error={galleryQuery.error}
                onRetry={galleryQuery.refetch}
              />
            )}

            {/* REVIEWS tab */}
            {activeTab === 'reviews' && (
              <div ref={reviewsSectionRef}>
                <MasterDetailsReviews
                  reviews={reviewsQuery.data ?? []}
                  isLoading={reviewsQuery.isLoading}
                  isError={reviewsQuery.isError}
                  error={reviewsQuery.error}
                  onRetry={reviewsQuery.refetch}
                  isClient={isClient}
                  isMaster={role === USER_ROLE.MASTER && isOwnProfile}
                  canCreateReview={canCreateReviewQuery.data ?? undefined}
                  reviewSubmission={reviewSubmission}
                />
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Lead form / CTA */}
            {!isOwnProfile && m?.user?.isVerified && role !== USER_ROLE.ADMIN && (
              <div id="lead-form" className="lg:sticky lg:top-24 space-y-3">
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
            )}

            {/* Quick Info — Figma: white card, light grey border, dark grey text */}
            <div className={cn(cardCls, 'p-6')}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ChevronRight size={14} className="text-primary" />
                </span>
                {t('masterDetails.quickInfo', 'Quick info')}
              </h3>
              <div className="space-y-1">
                {[
                  { icon: MapPin, label: t('masterDetails.quickInfoLocation', 'Location'), value: m?.city ? getTranslatedCityName(t, m.city) : '—' },
                  { icon: Briefcase, label: t('masterDetails.quickInfoCategory', 'Category'), value: m?.category ? getTranslatedCategoryName(t, m.category) : '—' },
                  { icon: Clock, label: t('masterDetails.experience'), value: experienceYears != null ? `${experienceYears} ${experienceYears === 1 ? t('masterDetails.experienceYear') : t('masterDetails.experienceYears')}` : '—' },
                  { icon: Calendar, label: t('masterDetails.quickInfoRegistered', 'Registered'), value: m?.createdAt ? formatDateShort(m.createdAt, locale) : '—' },
                  { icon: ShieldCheck, label: t('masterDetails.quickInfoStatus', 'Status'), value: m?.user?.isVerified ? t('masters.verified') : t('masters.notVerified') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/[0.06] last:border-0">
                    <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400">
                      <item.icon size={15} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar masters */}
            {masterId && (
              <div className={cn(cardCls, 'p-6')}>
                <SimilarMasters masterId={masterId} limit={4} variant="sidebar" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
