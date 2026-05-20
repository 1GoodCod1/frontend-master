import { memo } from 'react';
import { Paperclip, Download, Check, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ChatMessageProps as Props, MessageFile } from '@/types/chat';
import { getFileUrl, formatMessageTime, formatFileSize, isImageFile } from '@/utils/chat';
import { CHAT_BUBBLE_OTHER_CLS, CHAT_BUBBLE_OWN_CLS } from '@/features/chat/chatStyles';
import { cn } from '@/lib/utils';

export default memo(function ChatMessage({
  message,
  isOwn,
  showAvatar: _showAvatar = false,
  avatarUrl: _avatarUrl,
  senderName: _senderName,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex py-0.5 px-2', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[min(85%,320px)]',
          isOwn ? CHAT_BUBBLE_OWN_CLS : CHAT_BUBBLE_OTHER_CLS,
        )}
      >
        {message.content ? (
          <p className="whitespace-pre-wrap break-words text-[13px] leading-[1.35]">{message.content}</p>
        ) : null}

        {message.files && message.files.length > 0 ? (
          <div className={cn('space-y-1.5', message.content && 'mt-1.5')}>
            {message.files.map((mf: MessageFile) => (
              <div key={mf.id}>
                {isImageFile(mf.file.mimetype) ? (
                  <img
                    src={getFileUrl(mf.file.path)}
                    alt={mf.file.filename}
                    className="max-h-[180px] max-w-full cursor-pointer rounded-lg"
                    onClick={() => window.open(getFileUrl(mf.file.path), '_blank')}
                  />
                ) : (
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-lg p-2',
                      isOwn ? 'bg-white/15' : 'bg-[#F4F5F7] dark:bg-white/[0.06]',
                    )}
                  >
                    <Paperclip className="size-3.5 shrink-0 opacity-70" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium">{mf.file.filename}</p>
                      <p className="text-[10px] opacity-60">{formatFileSize(mf.file.size)}</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 shrink-0" asChild>
                            <a href={getFileUrl(mf.file.path)} download={mf.file.filename}>
                              <Download className="size-3.5" />
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
        ) : null}

        <div
          className={cn(
            'mt-0.5 flex items-center justify-end gap-0.5',
            isOwn ? 'text-white/75' : 'text-[#6C757D] dark:text-white/40',
          )}
        >
          <span className="text-[10px] tabular-nums">{formatMessageTime(message.createdAt)}</span>
          {isOwn ? (
            message.readAt ? (
              <CheckCheck className="size-3 opacity-90" aria-hidden />
            ) : (
              <Check className="size-3 opacity-60" aria-hidden />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
});
