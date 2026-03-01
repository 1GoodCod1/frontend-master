import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type NotificationSettings = {
  autoPinLeadStatusUpdates: boolean;
  autoPinReportedReviews: boolean;
  autoPinSpamClosedOnly: boolean;
  playSound: boolean;
};

type Props = {
  role: string | null;
  settings: NotificationSettings;
  onSettingsChange: (patch: Partial<NotificationSettings>) => void;
};

export function NotificationMenuSettings({
  role,
  settings,
  onSettingsChange,
}: Props) {
  const { t } = useTranslation();
  const isAdminOrMaster = role === 'ADMIN' || role === 'MASTER';
  const switchClassName =
    'h-6 w-11 border border-border/70 shadow-[inset_0_0_0_1px_hsl(var(--background)/0.15)] data-[state=unchecked]:bg-zinc-400/70 dark:data-[state=unchecked]:bg-zinc-700 data-[state=checked]:bg-emerald-500 dark:data-[state=checked]:bg-emerald-500';

  return (
    <>
      {isAdminOrMaster && (
        <div className="px-4 py-3">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {t('notifications.autoPinRules')}
          </p>
          <div className="grid gap-2 rounded-xl bg-muted/35 p-2">
            <div className="flex items-center justify-between gap-4 rounded-lg px-2.5 py-2">
              <Label htmlFor="pin-leads" className="cursor-pointer text-xs text-muted-foreground flex-1 min-w-0">
                {t('notifications.pinLeadStatusUpdates')}
              </Label>
              <Switch
                id="pin-leads"
                checked={settings.autoPinLeadStatusUpdates}
                className={switchClassName}
                onCheckedChange={(checked) =>
                  onSettingsChange({ autoPinLeadStatusUpdates: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg px-2.5 py-2">
              <Label htmlFor="play-sound" className="cursor-pointer text-xs text-muted-foreground flex-1 min-w-0">
                {t('notifications.playSound')}
              </Label>
              <Switch
                id="play-sound"
                checked={settings.playSound}
                className={switchClassName}
                onCheckedChange={(checked) =>
                  onSettingsChange({ playSound: checked })
                }
              />
            </div>
            {role === 'ADMIN' && (
              <>
                <div className="flex items-center justify-between gap-4 rounded-lg px-2.5 py-2">
                  <Label
                    htmlFor="pin-spam"
                    className={cn(
                      'cursor-pointer text-xs text-muted-foreground flex-1 min-w-0',
                      !settings.autoPinLeadStatusUpdates && 'opacity-50'
                    )}
                  >
                    {t('notifications.pinOnlySpamClosed')}
                  </Label>
                  <Switch
                    id="pin-spam"
                    checked={settings.autoPinSpamClosedOnly}
                    className={switchClassName}
                    disabled={!settings.autoPinLeadStatusUpdates}
                    onCheckedChange={(checked) =>
                      onSettingsChange({ autoPinSpamClosedOnly: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg px-2.5 py-2">
                  <Label htmlFor="pin-reviews" className="cursor-pointer text-xs text-muted-foreground flex-1 min-w-0">
                    {t('notifications.pinReportedReviews')}
                  </Label>
                  <Switch
                    id="pin-reviews"
                    checked={settings.autoPinReportedReviews}
                    className={switchClassName}
                    onCheckedChange={(checked) =>
                      onSettingsChange({ autoPinReportedReviews: checked })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
