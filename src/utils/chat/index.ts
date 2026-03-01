import { env } from '@/services/env';
import type { Conversation, ConversationDetail, ChatUserRole, OtherPartyDisplay } from '@/types/chat';
import { MIN_CONVERSATION_ID_LENGTH } from '@/features/chat/constants';

/** Whether the string is a valid conversation ID (not undefined/null and long enough). */
export function isValidConversationId(id: string | undefined): boolean {
  return Boolean(
    id &&
      id !== 'undefined' &&
      id !== 'null' &&
      id.length >= MIN_CONVERSATION_ID_LENGTH
  );
}

const LOCALE = 'ru-RU';

/** Build full URL for a file path (relative or absolute). */
export function getFileUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = env.apiUrl?.replace('/api', '') ?? '';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Format date for list preview: time today, yesterday label, weekday, or short date. */
export function formatMessageDate(dateString: string, yesterdayLabel: string = 'Вчера'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return yesterdayLabel;
  }
  if (diffDays < 7) {
    return date.toLocaleDateString(LOCALE, { weekday: 'short' });
  }
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

/** Format time only (HH:MM) for message bubble. */
export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** Truncate text with ellipsis. */
export function truncateMessage(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/** Human-readable file size. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Whether mimetype is image (for inline preview). */
export function isImageFile(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}

export function getOtherPartyFromConversation(
  conversation: Conversation | ConversationDetail | null,
  userRole: ChatUserRole
): OtherPartyDisplay | null {
  if (!conversation) return null;
  if (userRole === 'MASTER') {
    return {
      name: conversation.lead.clientName || conversation.clientPhone || 'Клиент',
      avatar: conversation.client?.avatarFile?.path,
    };
  }
  return {
    name: `${conversation.master.user.firstName} ${conversation.master.user.lastName}`,
    avatar: conversation.master.avatarFile?.path,
    isOnline: conversation.master.isOnline,
    lastActivityAt: conversation.master.lastActivityAt,
  };
}

/** Contact key for grouping: one chat per master (for client) or per client (for master). */
export function getContactKey(conversation: Conversation | ConversationDetail, userRole: ChatUserRole): string {
  if (userRole === 'CLIENT') {
    return conversation.master?.id ?? conversation.id;
  }
  const clientId =
    'clientId' in conversation
      ? conversation.clientId
      : conversation.client?.id ?? null;
  return clientId ?? conversation.clientPhone ?? conversation.lead?.clientPhone ?? conversation.id;
}

/** One row per contact: keep the latest conversation per contact. */
export function groupConversationsByContact(
  conversations: (Conversation | ConversationDetail)[],
  userRole: ChatUserRole
): (Conversation | ConversationDetail)[] {
  const activityTime = (c: Conversation | ConversationDetail): number => {
    const lastMessageAt =
      'lastMessage' in c && c.lastMessage ? c.lastMessage.createdAt : undefined;
    return new Date(lastMessageAt ?? c.updatedAt ?? c.createdAt ?? 0).getTime();
  };
  const byContact = new Map<string, Conversation | ConversationDetail>();
  for (const c of conversations) {
    const key = getContactKey(c, userRole);
    const existing = byContact.get(key);
    const cTime = activityTime(c);
    const exTime = existing ? activityTime(existing) : 0;
    if (!existing || cTime > exTime) {
      byContact.set(key, c);
    }
  }
  return Array.from(byContact.values()).sort((a, b) => {
    const aTime = activityTime(a);
    const bTime = activityTime(b);
    return bTime - aTime;
  });
}
