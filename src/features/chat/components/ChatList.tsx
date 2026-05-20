import { useState, useMemo } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CabinetFilterPill } from '@/components/cabinet/CabinetFilterPill';
import { useGetConversationsQuery, type Conversation } from '@/features/chat/chatApi';
import {
  getFileUrl,
  getOtherPartyFromConversation,
  groupConversationsByContact,
} from '@/utils/chat';
import type { ChatListProps } from '@/types/chat';
import { cn } from '@/lib/utils';
import {
  CHAT_ROW_IDLE_CLS,
  CHAT_ROW_SELECTED_CLS,
  CHAT_SEARCH_CLS,
} from '@/features/chat/chatStyles';
import { USER_ROLE } from '@/constants/roles';

type ChatTab = 'all' | 'unread';

export default function ChatList({
  onSelectConversation,
  selectedConversationId,
  userRole,
  title,
  className,
}: ChatListProps) {
  const { t } = useTranslation();
  const ns = userRole === USER_ROLE.CLIENT ? 'clientDashboard' : 'dashboard';

  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<ChatTab>('all');

  const { data: conversationsData, isLoading } = useGetConversationsQuery(undefined, { pollingInterval: 10_000 });

  const rawConversations = Array.isArray(conversationsData) ? conversationsData : [];
  const grouped = groupConversationsByContact(rawConversations, userRole) as Conversation[];

  const unreadCount = useMemo(
    () => grouped.filter((c) => ('unreadCount' in c ? c.unreadCount : 0) > 0).length,
    [grouped],
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

  const emptyBlock = (heading: string, hint: string) => (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12">
        <MessageCircle className="size-5" />
      </div>
      <p className="text-[13px] font-semibold text-[#212529] dark:text-white">{heading}</p>
      <p className="mt-0.5 text-[11px] text-[#6C757D] dark:text-white/50">{hint}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="space-y-2 p-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-2.5 py-1">
              <div className="size-9 shrink-0 animate-pulse rounded-full bg-[#E9ECEF] dark:bg-white/10" />
              <div className="flex-1 space-y-1.5 py-0.5">
                <div className="h-3 w-[55%] animate-pulse rounded bg-[#E9ECEF] dark:bg-white/10" />
                <div className="h-2.5 w-[75%] animate-pulse rounded bg-[#E9ECEF] dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (grouped.length === 0) {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        {title ? (
          <div className="shrink-0 border-b border-[#E9ECEF] px-3 py-2.5 dark:border-white/10">
            <h1 className="text-[15px] font-semibold tracking-tight text-[#212529] dark:text-white">{title}</h1>
          </div>
        ) : null}
        {emptyBlock(t(`${ns}.noActiveChats`), t(`${ns}.noActiveChatsHint`))}
      </div>
    );
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="shrink-0 border-b border-[#E9ECEF] px-3 py-2.5 dark:border-white/10">
        {title ? (
          <h1 className="mb-2 text-[15px] font-semibold tracking-tight text-[#212529] dark:text-white">{title}</h1>
        ) : null}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#6C757D] dark:text-white/40" />
          <input
            type="search"
            placeholder={t(`${ns}.chatSearchPlaceholder`)}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={CHAT_SEARCH_CLS}
          />
        </div>
        <div className="mt-2 flex gap-1.5">
          <CabinetFilterPill active={activeTab === 'all'} onClick={() => setActiveTab('all')} className="h-7 px-2.5 text-[12px]">
            {t(`${ns}.allChats`)}
          </CabinetFilterPill>
          <CabinetFilterPill active={activeTab === 'unread'} onClick={() => setActiveTab('unread')} className="h-7 px-2.5 text-[12px]">
            {t(`${ns}.unreadChats`)}
            {unreadCount > 0 ? (
              <span
                className={cn(
                  'ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums',
                  activeTab === 'unread' ? 'bg-white/25 text-white' : 'bg-[#E97525] text-white',
                )}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </CabinetFilterPill>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {conversations.length === 0 ? (
          activeTab === 'unread'
            ? emptyBlock(t('common.noUnreadChats'), t('common.noUnreadChatsHint'))
            : emptyBlock(t(`${ns}.noActiveChats`), t(`${ns}.noActiveChatsHint`))
        ) : (
          <ul className="py-1">
            {conversations.map((conv: Conversation) => {
              const isSelected = conv.id === selectedConversationId;
              const otherParty = getOtherPartyFromConversation(conv, userRole);
              const hasUnread = conv.unreadCount > 0;

              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2.5 py-2 pr-3 text-left transition-colors',
                      isSelected ? CHAT_ROW_SELECTED_CLS : CHAT_ROW_IDLE_CLS,
                    )}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <div className="relative shrink-0">
                      <Avatar className={cn('size-9', isSelected && 'ring-1 ring-[#E97525]/40')}>
                        <AvatarImage src={otherParty?.avatar ? getFileUrl(otherParty.avatar) : undefined} />
                        <AvatarFallback
                          className={cn(
                            'text-[11px] font-semibold text-white',
                            isSelected ? 'bg-[#E97525]' : 'bg-[#6C757D] dark:bg-white/20',
                          )}
                        >
                          {otherParty?.name?.[0]?.toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      {userRole === USER_ROLE.CLIENT && otherParty?.isOnline ? (
                        <span className="absolute bottom-0 right-0 size-2 rounded-full border border-white bg-emerald-500 dark:border-[#1a1a1a]" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-[13px]',
                            hasUnread && !isSelected ? 'font-bold text-[#212529] dark:text-white' : 'font-medium text-[#212529] dark:text-white/90',
                            isSelected && 'font-semibold text-[#E97525]',
                          )}
                        >
                          {otherParty?.name}
                        </span>
                        <span className="shrink-0 text-[10px] tabular-nums text-[#6C757D] dark:text-white/45">
                          {conv.lastMessage
                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'truncate text-[11px] leading-tight',
                          hasUnread && !isSelected ? 'font-medium text-[#495057] dark:text-white/70' : 'text-[#6C757D] dark:text-white/45',
                        )}
                      >
                        {conv.closedAt ? t('common.closedChat') : conv.lastMessage?.content ?? '—'}
                      </p>
                    </div>
                    {hasUnread ? (
                      <span className="size-2 shrink-0 rounded-full bg-[#E97525]" aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
