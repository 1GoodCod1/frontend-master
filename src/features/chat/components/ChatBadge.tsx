import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetUnreadCountQuery } from '@/features/chat/chatApi';
import type { ChatBadgeProps } from '@/types/chat';

export default function ChatBadge({ dashboardPath }: ChatBadgeProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 15_000,
  });

  const unreadCount = data?.count ?? 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate(`${dashboardPath}/chat`)}
          >
            <MessageCircle className="size-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px] font-bold"
                variant="destructive"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {unreadCount > 0 ? t('common.unreadCount', { count: unreadCount }) : t('common.chats')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
