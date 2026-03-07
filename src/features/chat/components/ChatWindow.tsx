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
  markConversationRead,
} from '@/features/chat/chatSlice';
import { getFileUrl, getOtherPartyFromConversation, isValidConversationId } from '@/utils/chat';
import { joinConversation, leaveConversation, sendTyping, markAsReadWs } from '@/services/chatSocket';
import type { ChatWindowProps } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  currentUserRole,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const didInitialScrollRef = useRef<string | null>(null);
  const lastMarkedRef = useRef<string | null>(null);
  const isValid = isValidConversationId(conversationId);
  const validConversationId = isValid ? conversationId : undefined;

  const typingUsers = useAppSelector(selectTypingUsers(validConversationId ?? ''));

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
    joinConversation(validConversationId);
    return () => {
      dispatch(setActiveConversation(null));
      leaveConversation(validConversationId);
    };
  }, [validConversationId, isValid, dispatch]);

  useEffect(() => {
    if (!isValid || !validConversationId) return;
    if (lastMarkedRef.current === validConversationId) return;
    lastMarkedRef.current = validConversationId;
    markAsRead(validConversationId);
    dispatch(markConversationRead(validConversationId));
    markAsReadWs(validConversationId);
  }, [validConversationId, isValid, markAsRead, dispatch]);

  useEffect(() => {
    const messages = messagesData?.messages ?? [];
    if (messages.length === 0) return;
    const conversationKey = validConversationId ?? '';
    const alreadyScrolled = didInitialScrollRef.current === conversationKey;
    if (!alreadyScrolled) {
      didInitialScrollRef.current = conversationKey;
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
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

  const messages = messagesData?.messages || [];

  if (loadingConversation) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="size-10 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="flex-1 space-y-4 p-4">
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
      <div className="border-b border-border/60 bg-muted/20 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={onBack}>
              <ArrowLeft className="size-5" />
            </Button>
          )}

          <Avatar className="size-11 shrink-0 border-2 border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300">
            <AvatarImage src={otherParty?.avatar ? getFileUrl(otherParty.avatar) : undefined} />
            <AvatarFallback className="font-semibold">{otherParty?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{otherParty?.name ?? '—'}</p>
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
              onClick={() => setSettingsOpen(true)}
              aria-label={t('chat.settings', 'Настройки чата')}
            >
              <MoreVertical className="size-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" aria-label={t('common.more', 'Ещё')}>
              <MoreVertical className="size-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto bg-muted/10 py-4 dark:bg-white/[0.02]">
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
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-center text-sm text-muted-foreground">
              {t('common.firstMessage')}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg: ChatMessageType) => {
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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {canSendMessages && (
        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={loadingMessages}
          quickReplies={isMaster ? (quickRepliesData?.items ?? []) : undefined}
          onManageQuickReplies={isMaster ? () => setSettingsOpen(true) : undefined}
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
        <div className="border-t border-border bg-warning/10 p-4 text-center text-sm text-muted-foreground">
          {t('common.chatClosed')}
        </div>
      )}

      {!canSendMessages && !conversation?.closedAt && !isLeadActive && (
        <Alert variant="default" className="mx-4 border-t border-border">
          <AlertTitle className="font-semibold">
            {currentUserRole === 'MASTER'
              ? t('common.chatNoActiveLeadMaster')
              : t('common.chatNoActiveLead')}
          </AlertTitle>
          <AlertDescription>
            {currentUserRole === 'MASTER'
              ? t('common.chatNoActiveLeadHintMaster')
              : t('common.chatNoActiveLeadHint')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
