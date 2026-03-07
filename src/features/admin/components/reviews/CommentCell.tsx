import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CommentCellProps {
  comment: string | null | undefined;
}

export default function CommentCell({ comment }: CommentCellProps) {
  const commentText = comment || '—';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm text-muted-foreground truncate block max-w-full cursor-default">
            {commentText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <p className="text-sm whitespace-pre-wrap break-words">{commentText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
