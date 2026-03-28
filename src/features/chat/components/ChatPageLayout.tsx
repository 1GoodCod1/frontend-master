import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChatList, ChatWindow } from '@/features/chat/components';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppSelector, useAppStore } from '@/app/hooks';
import { selectMe } from '@/features/auth/selectors';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { connectChatSocket, disconnectChatSocket } from '@/services/chatSocket';
import type { ChatUserRole } from '@/types/chat';

const DISCONNECT_DEFER_MS = 50;

export type { ChatUserRole };

export interface ChatPageLayoutProps {
  basePath: '/dashboard' | '/client-dashboard';
  titleKey: string;
  subtitleKey: string;
  selectChatKey: string;
  selectChatHintKey: string;
  userRole: ChatUserRole;
}

export function ChatPageLayout({
  basePath,
  titleKey,
  subtitleKey,
  selectChatKey,
  selectChatHintKey,
  userRole,
}: ChatPageLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const isLgUp = useMediaQuery('(min-width: 1024px)');

  const store = useAppStore();
  const currentUser = useAppSelector(selectMe);
  const currentUserId = currentUser?.id ?? '';

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const effectiveSelected = conversationId ?? selectedConversation;

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    connectChatSocket(store);
    return () => {
      mountedRef.current = false;
      setTimeout(() => {
        if (!mountedRef.current) disconnectChatSocket();
      }, DISCONNECT_DEFER_MS);
    };
  }, [store]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    navigate(`${basePath}/chat/${id}`);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    navigate(`${basePath}/chat`);
  };

  const layoutHeight = 'calc(100dvh - 140px)';

  if (!isLgUp) {
    return (
      <div className="flex flex-col min-h-0" style={{ height: layoutHeight }}>
        <PageHeader title={t(titleKey)} subtitle={t(subtitleKey)} className="shrink-0" />
        <div className="mt-3 sm:mt-4 flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl sm:rounded-2xl border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none">
          {effectiveSelected ? (
            <ChatWindow
              conversationId={effectiveSelected}
              onBack={handleBack}
              currentUserId={currentUserId}
              currentUserRole={userRole}
            />
          ) : (
            <div className="flex-1 overflow-auto">
              <ChatList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={effectiveSelected ?? undefined}
                userRole={userRole}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4" style={{ height: layoutHeight }}>
      <PageHeader title={t(titleKey)} subtitle={t(subtitleKey)} className="shrink-0" />
      <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none" style={{ minHeight: 0 }}>
        <div className="flex w-[320px] xl:w-[360px] min-w-0 shrink-0 flex-col overflow-hidden border-r border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-transparent">
          <ChatList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={effectiveSelected ?? undefined}
            userRole={userRole}
          />
        </div>

        <div className="w-px shrink-0 bg-slate-200/80 dark:bg-white/[0.08]" aria-hidden />

        <div className="min-w-0 flex-1 overflow-hidden flex flex-col bg-slate-50/40 dark:bg-white/[0.02]">
          {effectiveSelected ? (
            <ChatWindow
              conversationId={effectiveSelected}
              currentUserId={currentUserId}
              currentUserRole={userRole}
            />
          ) : (
            <div className="flex h-full min-h-[240px] sm:min-h-[320px] flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-8 text-center bg-slate-50/60 dark:bg-white/[0.03] border-2 border-dashed border-slate-200 dark:border-white/[0.08] m-2 sm:m-3 rounded-xl">
              <div className="flex size-14 sm:size-20 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-500/20">
                <svg className="size-8 sm:size-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.342 21c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground">{t(selectChatKey)}</p>
              <p className="max-w-xs text-[11px] sm:text-xs text-muted-foreground">{t(selectChatHintKey, 'Choose a conversation from the list to start messaging.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
