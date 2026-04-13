import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReviewReplyMutation, useReviewDeleteReplyMutation } from '@/features/reviews/reviewsApi';
import type { ReviewReply } from '@/types/masterDetailsReviews';

export function ReviewReplyForm({
  reviewId,
  existingReply,
}: {
  reviewId: string;
  existingReply?: ReviewReply | null;
}) {
  const { t } = useTranslation();
  const [replyContent, setReplyContent] = useState(existingReply?.content ?? '');
  const [showForm, setShowForm] = useState(false);
  const [replyToReview, { isLoading: isReplying }] = useReviewReplyMutation();
  const [deleteReply, { isLoading: isDeleting }] = useReviewDeleteReplyMutation();

  const handleSubmit = async () => {
    if (!replyContent.trim()) return;
    await replyToReview({ reviewId, content: replyContent.trim() });
    setShowForm(false);
  };

  const handleDelete = async () => {
    await deleteReply(reviewId);
    setReplyContent('');
    setShowForm(false);
  };

  if (existingReply && !showForm) {
    return (
      <div className="flex gap-2 ml-4 mt-2 p-3 rounded-lg bg-muted/50 border border-border">
        <CornerDownRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold text-foreground">{t('reviews.masterReply', 'Master reply')}</p>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{existingReply.content}</p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => {
                setShowForm(true);
                setReplyContent(existingReply.content ?? '');
              }}
            >
              {t('common.edit', 'Edit')}
            </button>
            <button
              type="button"
              className="text-xs text-destructive hover:text-destructive/80 underline"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '...' : t('common.delete', 'Delete')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showForm && !existingReply) {
    return (
      <button
        type="button"
        className="ml-4 mt-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 underline"
        onClick={() => setShowForm(true)}
      >
        <CornerDownRight className="h-3 w-3" />
        {t('reviews.replyToReview', 'Reply to this review')}
      </button>
    );
  }

  return (
    <div className="ml-4 mt-2 space-y-2 p-3 rounded-lg border border-border bg-muted/30">
      <p className="text-xs font-semibold">{t('reviews.yourReply', 'Your reply')}</p>
      <Textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder={t('reviews.replyPlaceholder', 'Write a professional reply...')}
        rows={2}
        className="resize-none text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={isReplying || !replyContent.trim()}>
          {isReplying ? t('common.loading') : t('common.save', 'Save')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
          {t('common.cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
}
