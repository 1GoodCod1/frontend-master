import { useEffect, useRef, useMemo, useState } from 'react';
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
import {
  useMastersGetQuickRepliesQuery,
  useMastersReplaceQuickRepliesMutation,
  useMastersGetAutoresponderSettingsQuery,
  useMastersUpdateAutoresponderSettingsMutation,
} from '@/features/masters/mastersApi';
import { MasterChatSettingsDialog } from './MasterChatSettingsDialog';

export default function ChatWindow({
  conversationId,
  onBack,
  currentUserId,
  currentUserRole,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didInitialScrollRef = useRef<string | null>(null);
  const lastMarkedRef = useRef<string | null>(null);
  const isValid = isValidConversationId(conversationId);
  const validConversationId = isValid ? conversationId : undefined;

  const allTypingUsers = useAppSelector(selectTypingUsers(validConversationId ?? ''));
  const typingUsers = allTypingUsers.filter((t) => t.userId && t.userId !== currentUserId);
  const chatConnected = useAppSelector(selectChatConnected);

  const { data: conversation, isLoading: loadingConversation } = useGetConversationQuery(
    validConversationId ?? '',
    { skip: !isValid }
  );
  const { data: messagesData, isLoading: loadingMessages } = useGetMessagesQuery(
    { id: validConversationId ?? '', page: 1, limit: 100 },
    { skip: !isValid }
  );
  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const isMaster = currentUserRole === 'MASTER';
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

    const tryJoin = () => {
      if (cancelled) return;
      joinConversation(validConversationId).then((res) => {
        if (cancelled) return;
        if (res.success) return;
        if (res.error === 'Not connected' && retryCount < maxRetries) {
          retryCount += 1;
          setTimeout(tryJoin, 800);
        }
      });
    };
    tryJoin();

    return () => {
      cancelled = true;
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

  const prevMessagesLengthRef = useRef(0);
  const prevConversationRef = useRef<string | null>(null);

  useEffect(() => {
    const messages = messagesData?.messages ?? [];
    const conversationKey = validConversationId ?? '';
    if (messages.length === 0) return;

    if (prevConversationRef.current !== conversationKey) {
      prevConversationRef.current = conversationKey;
      prevMessagesLengthRef.current = 0;
    }

    const prevLen = prevMessagesLengthRef.current;
    const messagesIncreased = messages.length > prevLen;
    prevMessagesLengthRef.current = messages.length;

    const shouldScroll = prevLen === 0 || messagesIncreased;

    if (prevLen === 0) {
      didInitialScrollRef.current = conversationKey;
    }

    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({
        behavior: prevLen === 0 ? 'auto' : 'smooth',
        block: 'end',
      });
    }
  }, [messagesData?.messages, validConversationId]);

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

  if (!isValid) {
    return (
      <div className="flex h-full items-center justify-center bg-background/50">
        <p className="text-muted-foreground">{t('common.selectChatToStart')}</p>
      </div>
    );
  }

  const leadStatus = conversation?.lead?.status;
  const isLeadActive = leadStatus && ['NEW', 'IN_PROGRESS'].includes(String(leadStatus));
  const canSendMessages = !conversation?.closedAt && Boolean(isLeadActive);

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
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" className="shrink-0 size-9 sm:size-10 rounded-full" onClick={onBack}>
              <ArrowLeft className="size-4 sm:size-5" />
            </Button>
          )}

          <div className="relative shrink-0">
            <Avatar className="size-9 sm:size-11 bg-slate-600 dark:bg-slate-500 text-white">
              <AvatarImage src={otherParty?.avatar ? getFileUrl(otherParty.avatar) : undefined} />
              <AvatarFallback className="font-semibold bg-slate-600 dark:bg-slate-500 text-white">
                {otherParty?.name
                  ?.split(/\s+/)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) ?? '?'}
              </AvatarFallback>
            </Avatar>
            {currentUserRole === 'CLIENT' && otherParty?.isOnline && (
              <span className="absolute bottom-0 left-0 size-2.5 rounded-full border-2 border-white dark:border-white/10 bg-emerald-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm sm:text-base font-semibold text-foreground">{otherParty?.name ?? '—'}</p>
            {typingUsers.length > 0 ? (
              <p className="text-xs italic text-primary">{t('common.typing')}</p>
            ) : conversation?.closedAt ? (
              <Badge variant="destructive" className="text-[10px]">
                {t('common.closedChat')}
              </Badge>
            ) : currentUserRole === 'CLIENT' && otherParty ? (
              <OnlineStatusBadge
                isOnline={otherParty.isOnline}
                lastActivityAt={otherParty.lastActivityAt}
                variant="text"
                size="small"
              />
            ) : null}
          </div>

          {isMaster ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setSettingsOpen(true)}
              aria-label={t('chat.settings', 'Настройки чата')}
            >
              <MoreVertical className="size-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
              aria-label={t('common.more', 'Ещё')}
            >
              <MoreVertical className="size-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto bg-muted/10 px-3 sm:px-4 py-3 sm:py-4 dark:bg-white/[0.02]">
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
          <div className="flex flex-col h-full items-center justify-center p-4 sm:p-6 gap-4">
            <p className="text-center text-xs sm:text-sm text-muted-foreground">
              {t('common.firstMessage')}
            </p>
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted/80 dark:bg-white/10 px-3 py-2">
                <p className="text-xs italic text-muted-foreground animate-pulse">{t('common.typing')}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {messagesByDate.map(({ dateKey, msgs }, index) => (
              <div key={dateKey}>
                <div
                  className={cn(
                    'flex items-center justify-center',
                    index === 0 ? 'mt-0 mb-4' : 'my-4'
                  )}
                >
                  <span className="px-3 py-1 rounded-full bg-muted/60 text-muted-foreground text-xs border border-slate-200/40 dark:border-transparent">
                    {getMessageDateLabel(msgs[0].createdAt, {
                      today: t('common.today'),
                      yesterday: t('common.yesterday'),
                    })}
                  </span>
                </div>
                {msgs.map((msg: ChatMessageType) => {
                  const isOwn =
                    (currentUserRole === 'CLIENT' && msg.senderType === 'CLIENT') ||
                    (currentUserRole === 'MASTER' && msg.senderType === 'MASTER');

                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isOwn={isOwn}
                      showAvatar={true}
                      avatarUrl={isOwn ? undefined : otherParty?.avatar}
                      senderName={isOwn ? 'Я' : otherParty?.name}
                    />
                  );
                })}
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="flex items-end gap-2 mt-2">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={otherParty?.avatar} alt="" />
                  <AvatarFallback className="text-[10px] bg-slate-500 text-white">
                    {(otherParty?.name ?? '?').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl rounded-bl-md bg-muted/80 dark:bg-white/10 px-3 py-2">
                  <p className="text-xs italic text-muted-foreground animate-pulse">{t('common.typing')}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
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

      {!canSendMessages && conversation?.closedAt && (
        <div className="border-t border-border bg-warning/10 p-3 sm:p-4 text-center text-xs sm:text-sm text-muted-foreground">
          {t('common.chatClosed')}
        </div>
      )}

      {!canSendMessages && !conversation?.closedAt && !isLeadActive && (
        <div
          className={cn(
            'mx-3 sm:mx-4 mt-3 rounded-xl px-4 py-3.5 text-sm',
            'bg-slate-100/90 dark:bg-white/[0.04]',
            'border border-slate-200/70 dark:border-white/[0.06]',
            'text-slate-700 dark:text-slate-300'
          )}
        >
          <p className="font-medium">
            {currentUserRole === 'MASTER'
              ? t('common.chatNoActiveLeadMaster')
              : t('common.chatNoActiveLead')}
          </p>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            {currentUserRole === 'MASTER'
              ? t('common.chatNoActiveLeadHintMaster')
              : t('common.chatNoActiveLeadHint')}
          </p>
        </div>
      )}
    </div>
  );
}
