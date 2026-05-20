import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { clientPageClassName } from '@/lib/clientCabinetStyles';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { useClientRequests, useRequestReviewModal } from '@/hooks/client/requests';
import { useBookingsMyBookingsQuery } from '@/features/bookings/bookingsApi';
import RequestsStatusFilter from '@/features/clients/components/requests/RequestsStatusFilter';
import ClientRequestsEmptyState from '@/features/clients/components/requests/ClientRequestsEmptyState';
import ClientRequestCard from '@/features/clients/components/requests/ClientRequestCard';
import RequestReviewModal from '@/features/clients/components/requests/RequestReviewModal';
import type { BookingDto } from '@/types';

export default function ClientRequestsPage() {
  const { t } = useTranslation();
  const { items, status, setStatus, isLoading, isError, error, refetch } = useClientRequests();
  const {
    isOpen: isReviewModalOpen,
    masterName,
    rating,
    comment,
    photos,
    criteriaRatings,
    setCriterionRating,
    submittedMasterIds,
    isLoading: isReviewSubmitting,
    openModal: openReviewModal,
    closeModal: closeReviewModal,
    submitReview,
    setRating,
    setComment,
    setPhotos,
  } = useRequestReviewModal();

  const { data: myBookings } = useBookingsMyBookingsQuery();

  // Map leadId → pending booking (most recent)
  const pendingBookingByLeadId = useMemo(() => {
    const map = new Map<string, BookingDto>();
    if (!myBookings) return map;
    for (const b of myBookings) {
      if (b.leadId && b.status === 'PENDING') {
        map.set(b.leadId, b);
      }
    }
    return map;
  }, [myBookings]);

  if (isLoading) return <CardsSkeleton count={5} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
    <div className={clientPageClassName}>
      <PageHeader
        title={t('clientDashboard.myLeads')}
        subtitle={t('clientDashboard.leadsSubtitle')}
      />

      <RequestsStatusFilter status={status} onChange={setStatus} />

      {items.length === 0 ? (
        <ClientRequestsEmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {items.map((lead) => (
            <ClientRequestCard
              key={lead.id}
              lead={lead}
              onOpenReviewModal={openReviewModal}
              reviewsSubmittedMasterIds={submittedMasterIds}
              pendingBooking={pendingBookingByLeadId.get(lead.id)}
            />
          ))}
        </div>
      )}

      <RequestReviewModal
        isOpen={isReviewModalOpen}
        masterName={masterName}
        rating={rating}
        comment={comment}
        photos={photos}
        criteriaRatings={criteriaRatings}
        isLoading={isReviewSubmitting}
        onClose={closeReviewModal}
        onRatingChange={setRating}
        onCommentChange={setComment}
        onPhotosChange={setPhotos}
        onCriterionChange={setCriterionRating}
        onSubmit={submitReview}
      />
    </div>
  );
}
