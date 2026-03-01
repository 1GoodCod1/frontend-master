import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChatList, ChatWindow } from '@/components/chat';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAppSelector } from '@/app/hooks';
import { useIsMdUp } from '@/hooks/useMediaQuery';
import { connectChatSocket, disconnectChatSocket } from '@/services/chatSocket';
import { store } from '@/app/store';
export default function ChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const isMdUp = useIsMdUp();

  const currentUser = useAppSelector((state) => state.auth.me);
  const currentUserId = currentUser?.id ?? '';

  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId ?? null);

  useEffect(() => {
    connectChatSocket(store);
    return () => {
      disconnectChatSocket();
    };
  }, []);

  useEffect(() => {
    if (conversationId && conversationId !== selectedConversation) {
      setSelectedConversation(conversationId);
    }
  }, [conversationId]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    navigate(`/dashboard/chat/${id}`);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    navigate('/dashboard/chat');
  };

  const layoutHeight = 'calc(100vh - 120px)';

  if (!isMdUp) {
    return (
      <div className="flex flex-col" style={{ height: layoutHeight }}>
        <PageHeader title={t('dashboard.chat')} subtitle={t('dashboard.chatSubtitle')} />
        <div className="mt-4 flex flex-1 flex-col overflow-hidden rounded-2xl border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation}
              onBack={handleBack}
              currentUserId={currentUserId}
              currentUserRole="MASTER"
            />
          ) : (
            <div className="flex-1 overflow-auto">
              <ChatList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation ?? undefined}
                userRole="MASTER"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" style={{ height: layoutHeight }}>
      <PageHeader title={t('dashboard.chat')} subtitle={t('dashboard.chatSubtitle')} />
      <div className="flex flex-1 gap-4 overflow-hidden rounded-2xl" style={{ minHeight: 0 }}>
        <div className="flex w-[340px] min-w-0 shrink-0 flex-col overflow-hidden rounded-2xl border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none">
          <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-4 py-3">
            <h2 className="font-bold tracking-tight text-foreground">{t('dashboard.allChats')}</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <ChatList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation ?? undefined}
              userRole="MASTER"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation}
              currentUserId={currentUserId}
              currentUserRole="MASTER"
            />
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/20">
                <svg className="size-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.342 21c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">{t('dashboard.selectChat')}</p>
              <p className="max-w-xs text-xs text-muted-foreground">{t('dashboard.selectChatHint', 'Choose a conversation from the list to start messaging.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
