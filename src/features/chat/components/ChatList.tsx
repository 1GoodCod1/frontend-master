import { useState, useMemo } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetConversationsQuery, type Conversation } from '@/features/chat/chatApi';
import {
  getFileUrl,
  getOtherPartyFromConversation,
  groupConversationsByContact,
} from '@/utils/chat';
import type { ChatListProps } from '@/types/chat';
import { cn } from '@/lib/utils';

type ChatTab = 'all' | 'unread';

export default function ChatList({
  onSelectConversation,
  selectedConversationId,
  userRole,
}: ChatListProps) {
  const { t } = useTranslation();
  const ns = userRole === 'CLIENT' ? 'clientDashboard' : 'dashboard';

  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<ChatTab>('all');

  const { data: conversationsData, isLoading } = useGetConversationsQuery();

  const rawConversations = Array.isArray(conversationsData) ? conversationsData : [];
  const grouped = groupConversationsByContact(rawConversations, userRole) as Conversation[];

  const unreadCount = useMemo(
    () => grouped.filter((c) => ('unreadCount' in c ? c.unreadCount : 0) > 0).length,
    [grouped]
  );

  const conversations = useMemo(() => {
    let filtered = grouped;
    if (activeTab === 'unread') {
      filtered = filtered.filter((c) => ('unreadCount' in c ? c.unreadCount : 0) > 0);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter((c) => {
        const other = getOtherPartyFromConversation(c, userRole);
        const name = (other?.name ?? '').toLowerCase();
        const lastMsg = (c.lastMessage?.content ?? '').toLowerCase();
        return name.includes(q) || lastMsg.includes(q);
      });
    }
    return filtered;
  }, [grouped, activeTab, searchText, userRole]);

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

  const emptyStateAll = (
    <div className="flex h-full min-h-[160px] sm:min-h-[200px] flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="mb-3 sm:mb-4 flex size-12 sm:size-16 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-500/10 dark:bg-orange-500/20">
        <MessageCircle className="size-6 sm:size-8 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 className="text-xs sm:text-sm font-semibold text-foreground">{t(`${ns}.noActiveChats`)}</h3>
      <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground">{t(`${ns}.noActiveChatsHint`)}</p>
    </div>
  );

  const emptyStateUnread = (
    <div className="flex h-full min-h-[160px] sm:min-h-[200px] flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="mb-3 sm:mb-4 flex size-12 sm:size-16 items-center justify-center rounded-xl sm:rounded-2xl bg-orange-500/10 dark:bg-orange-500/20">
        <MessageCircle className="size-6 sm:size-8 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 className="text-xs sm:text-sm font-semibold text-foreground">{t('common.noUnreadChats')}</h3>
      <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground">{t('common.noUnreadChatsHint')}</p>
    </div>
  );

  if (grouped.length === 0) {
    return emptyStateAll;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-white/50" />
          <input
            type="text"
            placeholder={t(`${ns}.chatSearchPlaceholder`)}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-foreground placeholder:text-slate-400 dark:placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 dark:focus:ring-orange-500/20 dark:focus:border-orange-500/40 transition-all"
          />
        </div>
      </div>

      <div className="px-3 sm:px-4 pb-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-all',
              activeTab === 'all'
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'text-muted-foreground hover:bg-muted/50',
            )}
          >
            {t(`${ns}.allChats`)}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5',
              activeTab === 'unread'
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'text-muted-foreground hover:bg-muted/50',
            )}
          >
            {t(`${ns}.unreadChats`)}
            {unreadCount > 0 && (
              <span className="size-5 min-w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-2">
        {conversations.length === 0 ? (
          activeTab === 'unread' ? emptyStateUnread : emptyStateAll
        ) : (
          <ul className="space-y-1 py-1">
            {conversations.map((conv: Conversation) => {
              const isSelected = conv.id === selectedConversationId;
              const otherParty = getOtherPartyFromConversation(conv, userRole);

              return (
                <li key={conv.id} className="px-1 first:pt-0 last:pb-0">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      'flex w-full items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer text-left border',
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 border-orange-500/30'
                        : 'hover:bg-muted/50 border-slate-200/40 dark:border-transparent',
                    )}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <div className="relative shrink-0">
                      <Avatar
                        className={cn(
                          'size-11',
                          isSelected
                            ? 'ring-2 ring-orange-500/30'
                            : '',
                        )}
                      >
                        <AvatarImage src={otherParty?.avatar ? getFileUrl(otherParty.avatar) : undefined} />
                        <AvatarFallback
                          className={cn(
                            isSelected
                              ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
                              : 'bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 text-white',
                          )}
                        >
                          {otherParty?.name?.[0]?.toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      {userRole === 'CLIENT' && otherParty?.isOnline && (
                        <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-sm',
                            isSelected ? 'text-orange-600 dark:text-orange-400 font-semibold' : 'text-foreground',
                            conv.unreadCount > 0 && !isSelected && 'font-bold',
                          )}
                        >
                          {otherParty?.name}
                        </span>
                        <span className="text-muted-foreground text-xs shrink-0">
                          {conv.lastMessage
                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm truncate mt-0.5">
                        {conv.closedAt
                          ? t('common.closedChat')
                          : conv.lastMessage?.content ?? '—'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 size-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </motion.button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
