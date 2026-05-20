import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { ChatList, ChatWindow } from '@/features/chat/components';
import { useAppSelector, useAppStore } from '@/app/hooks';
import { selectMe } from '@/features/auth/selectors';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { connectChatSocket, disconnectChatSocket } from '@/services/chatSocket';
import {
  CHAT_LAYOUT_HEIGHT_CLS,
  CHAT_LAYOUT_HEIGHT_MOBILE_CLS,
  CHAT_SHELL_CLS,
  CHAT_SIDEBAR_CLS,
  CHAT_THREAD_AREA_CLS,
} from '@/features/chat/chatStyles';
import { cn } from '@/lib/utils';
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
  subtitleKey: _subtitleKey,
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

  const layoutHeightCls = isLgUp ? CHAT_LAYOUT_HEIGHT_CLS : CHAT_LAYOUT_HEIGHT_MOBILE_CLS;

  const emptyThread = (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12">
        <MessageCircle className="size-7" strokeWidth={1.5} />
      </div>
      <p className="text-[13px] font-semibold text-[#212529] dark:text-white">{t(selectChatKey)}</p>
      <p className="max-w-[220px] text-[12px] leading-snug text-[#6C757D] dark:text-white/50">
        {t(selectChatHintKey, 'Choose a conversation from the list to start messaging.')}
      </p>
    </div>
  );

  if (!isLgUp) {
    return (
      <div className={cn('mx-auto flex w-full max-w-6xl min-h-0 flex-col', layoutHeightCls)}>
        <div className={cn(CHAT_SHELL_CLS, 'min-h-0 flex-1')}>
          {effectiveSelected ? (
            <ChatWindow
              conversationId={effectiveSelected}
              onBack={handleBack}
              currentUserId={currentUserId}
              currentUserRole={userRole}
            />
          ) : (
            <ChatList
              title={t(titleKey)}
              onSelectConversation={handleSelectConversation}
              selectedConversationId={effectiveSelected ?? undefined}
              userRole={userRole}
              className="h-full"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('mx-auto flex w-full max-w-6xl min-h-0 flex-col', layoutHeightCls)}>
      <div className={cn(CHAT_SHELL_CLS, 'min-h-0 flex-1 flex-row')}>
        <div className={CHAT_SIDEBAR_CLS}>
          <ChatList
            title={t(titleKey)}
            onSelectConversation={handleSelectConversation}
            selectedConversationId={effectiveSelected ?? undefined}
            userRole={userRole}
            className="h-full"
          />
        </div>

        <div className={CHAT_THREAD_AREA_CLS}>
          {effectiveSelected ? (
            <ChatWindow
              conversationId={effectiveSelected}
              currentUserId={currentUserId}
              currentUserRole={userRole}
            />
          ) : (
            emptyThread
          )}
        </div>
      </div>
    </div>
  );
}
