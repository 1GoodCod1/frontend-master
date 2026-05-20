import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Virtuoso, type Components } from 'react-virtuoso';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import {
  useGetMessagesQuery,
  useGetConversationQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  type ChatMessage as ChatMessageType,
} from '@/features/chat/chatApi';
import {
  setActiveConversation,
  selectTypingUsers,
  selectChatConnected,
  markConversationRead,
} from '@/features/chat/chatSlice';
import {
  getFileUrl,
  getOtherPartyFromConversation,
  getMessageDateKey,
  getMessageDateLabel,
  isValidConversationId,
} from '@/utils/chat';
import { joinConversation, leaveConversation, sendTyping, markAsReadWs } from '@/services/chatSocket';
import type { ChatWindowProps } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { OnlineStatusBadge } from '@/components/ui/OnlineStatusBadge';
import { cn } from '@/lib/utils';
import { CHAT_BUBBLE_OTHER_CLS, CHAT_HEADER_CLS } from '@/features/chat/chatStyles';
import { SENDER_TYPE } from '@/constants/senderType';
import {
  useMastersGetQuickRepliesQuery,
  useMastersReplaceQuickRepliesMutation,
  useMastersGetAutoresponderSettingsQuery,
  useMastersUpdateAutoresponderSettingsMutation,
} from '@/features/masters/mastersApi';
import { MasterChatSettingsDialog } from './MasterChatSettingsDialog';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';

type ChatTimelineItem =
  | { kind: 'date'; dateKey: string; createdAt: string }
  | { kind: 'msg'; message: ChatMessageType };

export default function ChatWindow({
  conversationId,
  onBack,
  currentUserId,
  currentUserRole,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const reduceMotion = useReducedMotionPreference();
  const lastMarkedRef = useRef<string | null>(null);
  const isValid = isValidConversationId(conversationId);
  const validConversationId = isValid ? conversationId : undefined;

  const allTypingUsers = useAppSelector(selectTypingUsers(validConversationId ?? ''));
  const typingUsers = allTypingUsers.filter((t) => t.userId && t.userId !== currentUserId);
  const chatConnected = useAppSelector(selectChatConnected);

  const { data: conversation, isLoading: loadingConversation } = useGetConversationQuery(
    validConversationId ?? '',
    { skip: !isValid, pollingInterval: 8_000 }
  );
  const { data: messagesData, isLoading: loadingMessages } = useGetMessagesQuery(
    { id: validConversationId ?? '', page: 1, limit: 100 },
    { skip: !isValid }
  );
  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const isMaster = currentUserRole === SENDER_TYPE.MASTER;
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: quickRepliesData } = useMastersGetQuickRepliesQuery(undefined, {
    skip: !isMaster,
  });
  const [replaceQuickReplies, { isLoading: savingQuickReplies }] =
    useMastersReplaceQuickRepliesMutation();

  const { data: autoresponderSettings } = useMastersGetAutoresponderSettingsQuery(
    undefined,
    { skip: !isMaster },
  );
  const [updateAutoresponder, { isLoading: savingAutoresponder }] =
    useMastersUpdateAutoresponderSettingsMutation();

  useEffect(() => {
    if (!isValid || !validConversationId) return;
    dispatch(setActiveConversation(validConversationId));
    if (!chatConnected) return;

    let cancelled = false;
    let retryCount = 0;
    const maxRetries = 8;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const tryJoin = () => {
      if (cancelled) return;
      joinConversation(validConversationId).then((res) => {
        if (cancelled) return;
        if (res.success) return;
        if (res.error === 'Not connected' && retryCount < maxRetries) {
          retryCount += 1;
          retryTimer = setTimeout(tryJoin, 800);
        }
      });
    };
    tryJoin();

    return () => {
      cancelled = true;
      if (retryTimer !== null) clearTimeout(retryTimer);
      dispatch(setActiveConversation(null));
      leaveConversation(validConversationId);
    };
  }, [validConversationId, isValid, chatConnected, dispatch]);

  useEffect(() => {
    if (!isValid || !validConversationId) return;
    if (lastMarkedRef.current === validConversationId) return;
    lastMarkedRef.current = validConversationId;
    markAsRead(validConversationId);
    dispatch(markConversationRead(validConversationId));
    markAsReadWs(validConversationId);
  }, [validConversationId, isValid, markAsRead, dispatch]);

  const handleSend = async (content: string, fileIds?: string[]) => {
    if (!isValid || !validConversationId || !canSendMessages) return;
    try {
      await sendMessage({
        conversationId: validConversationId,
        content,
        fileIds,
      }).unwrap();
    } catch {
      // ignore send errors
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!isValid || !validConversationId) return;
    sendTyping(validConversationId, isTyping);
  };

  const otherParty = useMemo(
    () => getOtherPartyFromConversation(conversation ?? null, currentUserRole),
    [conversation, currentUserRole]
  );

  const messages = useMemo(
    () => messagesData?.messages ?? [],
    [messagesData?.messages]
  );
  const messagesByDate = useMemo(() => {
    const groups = new Map<string, ChatMessageType[]>();
    for (const msg of messages) {
      const key = getMessageDateKey(msg.createdAt);
      const list = groups.get(key) ?? [];
      list.push(msg);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).map(([dateKey, msgs]) => ({ dateKey, msgs }));
  }, [messages]);

  const chatTimeline = useMemo((): ChatTimelineItem[] => {
    const items: ChatTimelineItem[] = [];
    for (const { dateKey, msgs } of messagesByDate) {
      if (msgs.length === 0) continue;
      items.push({
        kind: 'date',
        dateKey,
        createdAt: msgs[0].createdAt,
      });
      for (const msg of msgs) {
        items.push({ kind: 'msg', message: msg });
      }
    }
    return items;
  }, [messagesByDate]);

  const renderMessage = useCallback(
    (msg: ChatMessageType) => {
      const isOwn =
        (currentUserRole === SENDER_TYPE.CLIENT && msg.senderType === SENDER_TYPE.CLIENT) ||
        (currentUserRole === SENDER_TYPE.MASTER && msg.senderType === SENDER_TYPE.MASTER);

      return (
        <ChatMessage
          message={msg}
          isOwn={isOwn}
          showAvatar={false}
        />
      );
    },
    [currentUserRole, otherParty?.avatar, otherParty?.name],
  );

  const virtuosoComponents = useMemo<Components<ChatTimelineItem, undefined>>(
    () => ({
      Footer: () =>
        typingUsers.length > 0 ? (
          <div className="flex justify-start px-2 pb-1 pt-0.5">
            <div className={cn(CHAT_BUBBLE_OTHER_CLS, 'py-1.5')}>
              <p className="text-[11px] italic text-[#6C757D] dark:text-white/50">{t('common.typing')}…</p>
            </div>
          </div>
        ) : null,
    }),
    [typingUsers.length, otherParty, t],
  );

  if (!isValid) {
    return (
      <div className="flex h-full items-center justify-center bg-background/50">
        <p className="text-muted-foreground">{t('common.selectChatToStart')}</p>
      </div>
    );
  }

  const leadStatus = conversation?.lead?.status;
  const isLeadActive = leadStatus && ['NEW', 'IN_PROGRESS'].includes(String(leadStatus));
  const isJobConversation = !conversation?.leadId;
  const canSendMessages = !conversation?.closedAt && (Boolean(isLeadActive) || isJobConversation);

  if (loadingConversation) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 sm:gap-3 border-b border-border p-3 sm:p-4">
          <div className="size-9 sm:size-10 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="flex-1 space-y-3 sm:space-y-4 p-3 sm:p-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'h-14 w-[60%] animate-pulse rounded-2xl bg-muted',
                i % 2 === 0 && 'ml-auto',
                i % 2 !== 0 && 'w-[45%]',
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={CHAT_HEADER_CLS}>
        {onBack ? (
          <Button variant="ghost" size="icon" className="size-8 shrink-0 rounded-full" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
        ) : null}

        <div className="relative shrink-0">
          <Avatar className="size-8 bg-[#6C757D] text-white dark:bg-white/20">
            <AvatarImage src={otherParty?.avatar ? getFileUrl(otherParty.avatar) : undefined} />
            <AvatarFallback className="bg-[#6C757D] text-[11px] font-semibold text-white dark:bg-white/20">
              {otherParty?.name
                ?.split(/\s+/)
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) ?? '?'}
            </AvatarFallback>
          </Avatar>
          {currentUserRole === SENDER_TYPE.CLIENT && otherParty?.isOnline ? (
            <span className="absolute bottom-0 right-0 size-2 rounded-full border-2 border-white bg-emerald-500 dark:border-[hsl(var(--cabinet-card-bg))]" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-[#212529] dark:text-white">{otherParty?.name ?? '—'}</p>
          {typingUsers.length > 0 ? (
            <p className="text-[11px] italic text-[#E97525]">{t('common.typing')}…</p>
          ) : conversation?.closedAt ? (
            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
              {t('common.closedChat')}
            </Badge>
          ) : currentUserRole === SENDER_TYPE.CLIENT && otherParty ? (
            <OnlineStatusBadge
              isOnline={otherParty.isOnline}
              lastActivityAt={otherParty.lastActivityAt}
              variant="text"
              size="small"
            />
          ) : null}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-[#6C757D] hover:text-[#212529] dark:text-white/50 dark:hover:text-white"
          onClick={isMaster ? () => setSettingsOpen(true) : undefined}
          aria-label={isMaster ? t('chat.settings', 'Настройки чата') : t('common.more', 'Ещё')}
        >
          <MoreVertical className="size-4" />
        </Button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col bg-[#F4F5F7] px-1 py-2 dark:bg-black/25">
        {loadingMessages ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-12 w-[60%] animate-pulse rounded-2xl bg-muted',
                  i % 2 === 0 && 'ml-auto',
                  i % 2 !== 0 && 'w-[50%]',
                )}
              />
            ))}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted/80 dark:bg-white/10 px-3 py-2 w-fit">
                <p className="text-xs italic text-muted-foreground animate-pulse">{t('common.typing')}</p>
              </div>
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4">
            <p className="text-center text-[12px] text-[#6C757D] dark:text-white/50">{t('common.firstMessage')}</p>
          </div>
        ) : (
          <Virtuoso<ChatTimelineItem, undefined>
            key={validConversationId}
            className="min-h-0 flex-1"
            style={{ height: '100%' }}
            data={chatTimeline}
            alignToBottom
            followOutput={reduceMotion ? 'auto' : 'smooth'}
            defaultItemHeight={52}
            increaseViewportBy={{ top: 80, bottom: 120 }}
            computeItemKey={(index, item) =>
              item.kind === 'date' ? `date-${item.dateKey}-${index}` : item.message.id
            }
            components={virtuosoComponents}
            itemContent={(index, item) => {
              if (item.kind === 'date') {
                const isFirst = index === 0;
                return (
                  <div className={cn('flex justify-center py-1', isFirst ? 'pt-0' : 'pt-2')}>
                    <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-medium text-[#6C757D] shadow-sm dark:bg-white/10 dark:text-white/50">
                      {getMessageDateLabel(item.createdAt, {
                        today: t('common.today'),
                        yesterday: t('common.yesterday'),
                      })}
                    </span>
                  </div>
                );
              }
              return renderMessage(item.message);
            }}
          />
        )}
      </div>

      {canSendMessages && (
        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={loadingMessages}
        />
      )}

      {isMaster && (
        <MasterChatSettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          quickReplies={quickRepliesData?.items ?? []}
          autoresponder={autoresponderSettings}
          isSavingQuickReplies={savingQuickReplies}
          isSavingAutoresponder={savingAutoresponder}
          onSaveQuickReplies={async (items) => {
            await replaceQuickReplies({ items }).unwrap();
            setSettingsOpen(false);
          }}
          onSaveAutoresponder={async (input) => {
            await updateAutoresponder(input).unwrap();
            setSettingsOpen(false);
          }}
        />
      )}

      {!canSendMessages && conversation?.closedAt ? (
        <div className="shrink-0 border-t border-[#E9ECEF] bg-[#FFF8EB]/80 px-3 py-2 text-center text-[12px] text-[#6C757D] dark:border-white/10 dark:bg-[#E97525]/8">
          {t('common.chatClosed')}
        </div>
      ) : null}

      {!canSendMessages && !conversation?.closedAt && !isLeadActive && !isJobConversation ? (
        <div className="mx-2 mb-2 shrink-0 rounded-[12px] border border-[#E9ECEF] bg-white px-3 py-2.5 text-[12px] dark:border-white/10 dark:bg-white/[0.04]">
          <p className="font-medium">
            {currentUserRole === SENDER_TYPE.MASTER
              ? t('common.chatNoActiveLeadMaster')
              : t('common.chatNoActiveLead')}
          </p>
          <p className="mt-1 text-[#6C757D] dark:text-white/50">
            {currentUserRole === SENDER_TYPE.MASTER
              ? t('common.chatNoActiveLeadHintMaster')
              : t('common.chatNoActiveLeadHint')}
          </p>
        </div>
      ) : null}
    </div>
  );
}
