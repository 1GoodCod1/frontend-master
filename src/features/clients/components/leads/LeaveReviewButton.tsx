import { useTranslation } from 'react-i18next';
import { useReviewsCanCreateQuery } from '@/features/reviews/reviewsApi';
import { Button } from '@/components/ui/button';
import type { LeadDto } from '@/types/leads';

interface LeaveReviewButtonProps {
  lead: LeadDto;
  onOpenModal: (lead: LeadDto) => void;
  reviewsSubmittedMasterIds: Set<string>;
}

export default function LeaveReviewButton({
  lead,
  onOpenModal,
  reviewsSubmittedMasterIds,
}: LeaveReviewButtonProps) {
  const { t } = useTranslation();
  const masterId = lead?.master?.id;
  const canCreate = useReviewsCanCreateQuery(masterId ?? '', {
    skip: lead?.status !== 'CLOSED' || !masterId,
    refetchOnMountOrArgChange: true, // Always refetch when lead transitions to CLOSED
  });

  if (lead?.status !== 'CLOSED' || !masterId) return null;
  if (reviewsSubmittedMasterIds.has(masterId)) return null;
  if (canCreate.data && !canCreate.data.canCreate) return null;
  if (canCreate.isLoading) return null;

  return (
    <Button
      size="sm"
      onClick={() => onOpenModal(lead)}
      className="border-0 bg-amber-600 text-white font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600"
    >
      {t('reviews.leaveReview')}
    </Button>
  );
}
