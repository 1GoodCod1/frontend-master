import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MessageCellProps {
  message: string | null | undefined;
}

export default function MessageCell({ message }: MessageCellProps) {
  const messageText = message || '—';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm text-muted-foreground truncate block max-w-full cursor-default">
            {messageText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <p className="text-sm whitespace-pre-wrap break-words">{messageText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
