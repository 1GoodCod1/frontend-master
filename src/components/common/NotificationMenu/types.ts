export type TabKey = 'all' | 'leads' | 'reviews' | 'system' | 'payments';

export type NotificationRoutePayload = {
  conversationId?: string;
  masterId?: string;
  data?: { masterId?: string };
};

export type NotificationGroupLabel = 'pinned' | 'today' | 'yesterday' | 'older';
