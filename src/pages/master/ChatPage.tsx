import { ChatPageLayout } from '@/features/chat/components/ChatPageLayout';

export default function ChatPage() {
  return (
    <ChatPageLayout
      basePath="/dashboard"
      titleKey="dashboard.chat"
      subtitleKey="dashboard.chatSubtitle"
      selectChatKey="dashboard.selectChat"
      selectChatHintKey="dashboard.selectChatHint"
      userRole="MASTER"
    />
  );
}
