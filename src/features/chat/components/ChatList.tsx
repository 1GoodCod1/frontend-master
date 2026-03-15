import { MessageCircle, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetConversationsQuery, type Conversation } from '@/features/chat/chatApi';
import {
  getFileUrl,
  getOtherPartyFromConversation,
  groupConversationsByContact,
} from '@/utils/chat';
import type { ChatListProps } from '@/types/chat';
import { cn } from '@/lib/utils';

export default function ChatList({
  onSelectConversation,
  selectedConversationId,
  userRole,
}: ChatListProps) {
  const { t } = useTranslation();
  const ns = userRole === 'CLIENT' ? 'clientDashboard' : 'dashboard';

  const { data: conversationsData, isLoading } = useGetConversationsQuery();

  const rawConversations = Array.isArray(conversationsData) ? conversationsData : [];
  const conversations = groupConversationsByContact(rawConversations, userRole) as Conversation[];

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-2 sm:gap-3">
            <div className="size-10 sm:size-12 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-[60%] animate-pulse rounded bg-muted" />
              <div className="h-4 w-[80%] animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full min-h-[160px] sm:min-h-[200px] flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="mb-3 sm:mb-4 flex size-12 sm:size-16 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-500/20">
          <MessageCircle className="size-6 sm:size-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-foreground">{t(`${ns}.noActiveChats`)}</h3>
        <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground">{t(`${ns}.noActiveChatsHint`)}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1 py-1">
      {conversations.map((conv: Conversation) => {
        const isSelected = conv.id === selectedConversationId;
        const otherParty = getOtherPartyFromConversation(conv, userRole);

        return (
          <li key={conv.id} className="px-1.5 sm:px-2 first:pt-0 last:pb-0">
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 text-left transition-all border',
                'hover:bg-muted/50 dark:hover:bg-white/[0.05]',
                isSelected
                  ? 'bg-amber-500/20 dark:bg-amber-500/25 border-amber-500/40 dark:border-amber-500/50 border-l-4 border-l-amber-500 dark:border-l-amber-400'
                  : 'bg-slate-50/70 dark:bg-white/[0.04] border-slate-200/80 dark:border-white/[0.06]',
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="relative shrink-0">
                {conv.unreadCount > 0 && (
                  <Badge
                    className="absolute -right-0.5 -top-0.5 size-5 min-w-5 justify-center rounded-full bg-amber-500 p-0 text-[10px] text-white dark:bg-amber-500"
                    variant="default"
                  >
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </Badge>
                )}
                <Avatar
                  className={cn(
                    'size-10 sm:size-12 border-2 bg-muted text-foreground dark:bg-white/10',
                    isSelected ? 'border-amber-500/50' : 'border-transparent',
                  )}
                >
                  <AvatarImage src={otherParty?.avatar ? getFileUrl(otherParty.avatar) : undefined} />
                  <AvatarFallback className="font-semibold">
                    {otherParty?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {userRole === 'CLIENT' && otherParty?.isOnline !== undefined && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full border-2 border-background">
                          <Circle
                            className={cn(
                              'size-2 fill-current',
                              otherParty.isOnline ? 'text-green-500' : 'text-muted-foreground',
                            )}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {otherParty.isOnline ? t('master.status.online') : t('master.status.offline')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'truncate text-sm',
                      conv.unreadCount > 0 ? 'font-bold' : 'font-medium',
                    )}
                  >
                    {otherParty?.name}
                  </span>
                  {conv.closedAt && (
                    <Badge variant="destructive" className="shrink-0 text-[9px]">
                      {t('common.closedChat')}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
