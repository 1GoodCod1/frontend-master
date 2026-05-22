import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotificationMenu } from './useNotificationMenu';
import { NotificationMenuHeader } from './NotificationMenuHeader';
import { NotificationMenuSettings } from './NotificationMenuSettings';
import { NotificationMenuTabs } from './NotificationMenuTabs';

export function NotificationMenu() {
  const {
    open,
    setOpen,
    tab,
    role,
    notifications,
    settings,
    unread,
    unreadByTab,
    grouped,
    handleClose,
    handleMarkAllRead,
    handleClearAll,
    handleMarkRead,
    handleSettings,
    setTab,
  } = useNotificationMenu();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="notifications"
          className="relative transition-colors duration-200"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground px-1 leading-none pointer-events-none">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="theme-panel-dropdown w-[390px] max-w-[92vw] overflow-hidden rounded-2xl border border-border p-0 shadow-md dark:shadow-black/40"
        align="end"
        sideOffset={10}
      >
        <NotificationMenuHeader
          unread={unread}
          totalCount={notifications.length}
          onMarkAllRead={handleMarkAllRead}
          onClearAll={handleClearAll}
        />
        <NotificationMenuSettings
          role={role}
          settings={settings}
          onSettingsChange={handleSettings}
        />
        <NotificationMenuTabs
          tab={tab}
          role={role}
          unread={unread}
          unreadByTab={unreadByTab}
          grouped={grouped}
          onTabChange={setTab}
          onMarkRead={handleMarkRead}
          onClose={handleClose}
        />
      </PopoverContent>
    </Popover>
  );
}
