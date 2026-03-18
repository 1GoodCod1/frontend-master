import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { useClientLeads, useReviewModal } from '@/hooks/client/leads';
import LeadsStatusFilter from '@/features/clients/components/leads/LeadsStatusFilter';
import LeadsEmptyState from '@/features/clients/components/leads/LeadsEmptyState';
import LeadCard from '@/features/clients/components/leads/LeadCard';
import ReviewModal from '@/features/clients/components/leads/ReviewModal';

export default function ClientLeadsPage() {
  const { t } = useTranslation();
  const { items, status, setStatus, isLoading, isError, error, refetch } = useClientLeads();
  const {
    isOpen: isReviewModalOpen,
    masterName,
    rating,
    comment,
    photos,
    submittedMasterIds,
    isLoading: isReviewSubmitting,
    openModal: openReviewModal,
    closeModal: closeReviewModal,
    submitReview,
    setRating,
    setComment,
    setPhotos,
  } = useReviewModal();

  if (isLoading) return <CardsSkeleton count={5} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('clientDashboard.myLeads')}
        subtitle={t('clientDashboard.leadsSubtitle')}
      />

      <LeadsStatusFilter status={status} onChange={setStatus} />

      {items.length === 0 ? (
        <LeadsEmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {items.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onOpenReviewModal={openReviewModal}
              reviewsSubmittedMasterIds={submittedMasterIds}
            />
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={isReviewModalOpen}
        masterName={masterName}
        rating={rating}
        comment={comment}
        photos={photos}
        isLoading={isReviewSubmitting}
        onClose={closeReviewModal}
        onRatingChange={setRating}
        onCommentChange={setComment}
        onPhotosChange={setPhotos}
        onSubmit={submitReview}
      />
    </div>
  );
}
