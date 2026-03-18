import { ChatPageLayout } from '@/features/chat/components/ChatPageLayout';

export default function ClientChatPage() {
  return (
    <ChatPageLayout
      basePath="/client-dashboard"
      titleKey="clientDashboard.chat"
      subtitleKey="clientDashboard.chatSubtitle"
      selectChatKey="clientDashboard.selectChat"
      selectChatHintKey="clientDashboard.selectChatHint"
      userRole="CLIENT"
    />
  );
}
