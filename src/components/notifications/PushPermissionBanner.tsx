import { useTranslation } from 'react-i18next';
import { Bell, BellOff, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWebPush } from '@/hooks/useWebPush';

const PUSH_BANNER_DISMISSED_KEY = 'push-banner-dismissed';

function getDismissedFromStorage(): boolean {
    try {
        return localStorage.getItem(PUSH_BANNER_DISMISSED_KEY) === 'true';
    } catch {
        return false;
    }
}

function setDismissedToStorage(value: boolean): void {
    try {
        if (value) {
            localStorage.setItem(PUSH_BANNER_DISMISSED_KEY, 'true');
        } else {
            localStorage.removeItem(PUSH_BANNER_DISMISSED_KEY);
        }
    } catch {
        /* ignore */
    }
}

export function PushPermissionBanner() {
    const { t } = useTranslation();
    const { permissionState, isSubscribed, isLoading, isSupported, subscribe } =
        useWebPush();
    const [dismissed, setDismissed] = useState(getDismissedFromStorage);

    const handleDismiss = () => {
        setDismissed(true);
        setDismissedToStorage(true);
    };

    // Don't show if: not supported, already subscribed, denied, or dismissed
    if (!isSupported || isSubscribed || permissionState === 'denied' || dismissed) {
        return null;
    }

    return (
        <div className="relative mx-auto mb-4 max-w-6xl animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                        {t('pushBanner.title', 'Включить уведомления?')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {t(
                            'pushBanner.description',
                            'Получайте уведомления о новых заявках, сообщениях и обновлениях.',
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        className="gap-1.5 font-semibold"
                        onClick={subscribe}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Bell className="h-3.5 w-3.5" />
                        )}
                        {t('pushBanner.enable', 'Включить')}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Toggle button for push notifications (settings page)
 */
export function PushNotificationToggle() {
    const { t } = useTranslation();
    const { isSubscribed, isLoading, isSupported, subscribe, unsubscribe } =
        useWebPush();

    if (!isSupported) return null;

    return (
        <Button
            variant={isSubscribed ? 'outline' : 'default'}
            size="sm"
            className="gap-2 font-semibold"
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading}
        >
            {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isSubscribed ? (
                <BellOff className="h-4 w-4" />
            ) : (
                <Bell className="h-4 w-4" />
            )}
            {isSubscribed
                ? t('pushToggle.disable', 'Отключить push')
                : t('pushToggle.enable', 'Включить push')}
        </Button>
    );
}
