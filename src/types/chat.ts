/** Chat domain types — shared between API, components and socket. */

export type ChatUserRole = 'CLIENT' | 'MASTER';

export interface ChatFile {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface MessageFile {
  id: string;
  file: ChatFile;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: ChatUserRole;
  content: string;
  files: MessageFile[];
  readAt: string | null;
  createdAt: string;
}

export interface LeadInfo {
  id: string;
  clientName: string | null;
  clientPhone: string;
  message: string;
  status: string;
}

export interface MasterInfo {
  id: string;
  user: { firstName: string; lastName: string; avatarFile?: { path: string } | null };
  isOnline?: boolean;
  lastActivityAt?: string | null;
  avatarFile: { path: string } | null;
}

export interface ClientInfo {
  id: string;
  email: string;
  avatarFile: { path: string } | null;
}

export interface Conversation {
  id: string;
  leadId: string;
  lead: LeadInfo;
  master: MasterInfo;
  client: ClientInfo | null;
  clientPhone: string | null;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface ConversationDetail extends Omit<Conversation, 'lastMessage' | 'unreadCount'> {
  masterId: string;
  clientId: string | null;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextCursor?: string | null;
  };
}

export interface SendMessageDto {
  content: string;
  fileIds?: string[];
}

export interface CreateConversationDto {
  leadId: string;
}

/** Props / UI types used by chat components. */
export interface ChatWindowProps {
  conversationId?: string;
  onBack?: () => void;
  currentUserId: string;
  currentUserRole: ChatUserRole;
}

export interface ChatListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
  userRole: ChatUserRole;
}

export interface ChatInputProps {
  onSend: (content: string, fileIds?: string[]) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  senderName?: string;
}

export interface OtherPartyDisplay {
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastActivityAt?: string | null;
}

export interface ChatBadgeProps {
  dashboardPath: string;
}

export interface QuickReply {
  id: string;
  text: string;
  order: number;
}

export interface QuickRepliesResponse {
  items: QuickReply[];
}

export interface ReplaceQuickRepliesRequest {
  items: Array<{
    text: string;
    order?: number;
  }>;
}

export interface AutoresponderSettings {
  autoresponderEnabled: boolean;
  autoresponderMessage: string | null;
  workStartHour: number;
  workEndHour: number;
}

export interface UpdateAutoresponderRequest {
  enabled?: boolean;
  message?: string | null;
}

