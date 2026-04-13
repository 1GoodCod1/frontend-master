import { useTranslation } from 'react-i18next';
import { CornerDownRight } from 'lucide-react';
import type { ReviewReply } from '@/types/masterDetailsReviews';

export function ReviewReplyDisplay({ reply }: { reply: ReviewReply }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 ml-4 mt-2 p-3 rounded-lg bg-muted/40 border border-border/60">
      <CornerDownRight className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          {t('reviews.masterReply', 'Master reply')}
        </p>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{reply.content}</p>
      </div>
    </div>
  );
}
