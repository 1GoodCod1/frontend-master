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

/** Date key for grouping messages (YYYY-MM-DD). */
export function getMessageDateKey(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns date label for divider: 'today' | 'yesterday' | formatted date. Use with i18n. */
export function getMessageDateLabel(
  dateString: string,
  labels: { today: string; yesterday: string }
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return labels.today;
  if (diffDays === 1) return labels.yesterday;
  return date.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
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

/** One row per contact: keep the latest conversation per contact, sum unreadCount across all conversations for that contact. */
export function groupConversationsByContact(
  conversations: (Conversation | ConversationDetail)[],
  userRole: ChatUserRole
): (Conversation | ConversationDetail)[] {
  const activityTime = (c: Conversation | ConversationDetail): number => {
    const lastMessageAt =
      'lastMessage' in c && c.lastMessage ? c.lastMessage.createdAt : undefined;
    return new Date(lastMessageAt ?? c.updatedAt ?? c.createdAt ?? 0).getTime();
  };
  const getUnread = (c: Conversation | ConversationDetail): number =>
    'unreadCount' in c ? c.unreadCount : 0;

  const byContact = new Map<
    string,
    { conv: Conversation | ConversationDetail; unreadTotal: number }
  >();

  for (const c of conversations) {
    const key = getContactKey(c, userRole);
    const unread = getUnread(c);
    const existing = byContact.get(key);
    const cTime = activityTime(c);
    const exTime = existing ? activityTime(existing.conv) : 0;

    if (!existing) {
      byContact.set(key, { conv: c, unreadTotal: unread });
    } else {
      const newUnreadTotal = existing.unreadTotal + unread;
      if (cTime > exTime) {
        byContact.set(key, { conv: c, unreadTotal: newUnreadTotal });
      } else {
        byContact.set(key, { conv: existing.conv, unreadTotal: newUnreadTotal });
      }
    }
  }

  const result = Array.from(byContact.values()).map(({ conv, unreadTotal }) => ({
    ...conv,
    unreadCount: unreadTotal,
  })) as (Conversation | ConversationDetail)[];

  return result.sort((a, b) => {
    const aTime = activityTime(a);
    const bTime = activityTime(b);
    return bTime - aTime;
  });
}
