import { memo } from 'react';
import { Paperclip, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ChatMessageProps as Props, MessageFile } from '@/types/chat';
import { getFileUrl, formatMessageTime, formatFileSize, isImageFile } from '@/utils/chat';
import { cn } from '@/lib/utils';

export default memo(function ChatMessage({
  message,
  isOwn,
  showAvatar = true,
  avatarUrl,
  senderName,
}: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'mb-3 flex justify-end px-1',
        !isOwn && 'justify-start',
      )}
    >
      <div
        className={cn(
          'flex max-w-[75%] items-end gap-2',
          isOwn && 'flex-row-reverse',
        )}
      >
        {showAvatar && (
          <Avatar className="size-8 shrink-0 text-sm">
            <AvatarImage src={avatarUrl ? getFileUrl(avatarUrl) : undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {senderName?.[0]?.toUpperCase() ?? (isOwn ? 'Я' : 'М')}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            'relative rounded-2xl px-4 py-2.5 shadow-sm',
            isOwn
              ? 'rounded-br-md bg-gradient-to-r from-orange-500 to-amber-500 text-white'
              : 'rounded-bl-md bg-white dark:bg-white/10 dark:text-foreground shadow-sm',
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-snug">
            {message.content}
          </p>

          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.files.map((mf: MessageFile) => (
                <div key={mf.id}>
                  {isImageFile(mf.file.mimetype) ? (
                    <img
                      src={getFileUrl(mf.file.path)}
                      alt={mf.file.filename}
                      className="max-h-[200px] max-w-full cursor-pointer rounded-md"
                      onClick={() => window.open(getFileUrl(mf.file.path), '_blank')}
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex items-center gap-2 rounded-md p-2',
                        isOwn ? 'bg-primary-foreground/15' : 'bg-primary/10',
                      )}
                    >
                      <Paperclip className="size-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs">{mf.file.filename}</p>
                        <p className="text-[10px] opacity-70">{formatFileSize(mf.file.size)}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 shrink-0" asChild>
                              <a href={getFileUrl(mf.file.path)} download={mf.file.filename}>
                                <Download className="size-4" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('common.download')}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="text-[10px] opacity-70">{formatMessageTime(message.createdAt)}</span>
            {isOwn &&
              (message.readAt ? (
                <span className="inline-flex opacity-90">✓✓</span>
              ) : (
                <span className="inline-flex opacity-60">✓</span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});
