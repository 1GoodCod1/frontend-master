import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { MessageCircle, Send, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNotificationSettings } from '@/hooks/master/useNotificationSettings';
import { useMastersCreateTelegramConnectLinkMutation } from '@/features/masters/mastersApi';
import type { LeadNotifyChannel } from '@/types';

const iconClass = 'size-5';
const LEAD_CHANNEL_OPTIONS: LeadNotifyChannel[] = ['telegram', 'whatsapp', 'both', 'none'];
const POLL_INTERVAL_MS = 3000;
const POLL_DURATION_MS = 60000;

export function NotificationChannelsForm() {
  const { t } = useTranslation();
  const { isPremium, settings, form, updateForm, save, isLoading, isSaving, refetch } =
    useNotificationSettings();
  const [createLink, { isLoading: isCreatingLink }] =
    useMastersCreateTelegramConnectLinkMutation();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSave = async () => {
    await save();
  };

  const handleConnectTelegram = useCallback(async () => {
    try {
      const { link } = await createLink().unwrap();
      window.open(link, '_blank', 'noopener,noreferrer');
      toast.success(t('notificationSettings.telegram.connectToast'));
      const stopAt = Date.now() + POLL_DURATION_MS;
      pollRef.current = setInterval(() => {
        void refetch();
        if (Date.now() >= stopAt && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }, POLL_INTERVAL_MS);
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message;
      toast.error(msg || t('notificationSettings.telegram.connectError'));
    }
  }, [createLink, refetch, t]);

  useEffect(() => {
    if (settings.telegramChatId && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [settings.telegramChatId]);

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      {isPremium && (
        <>
          <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
            <CardContent className="p-6">
              <Label className="text-base font-semibold">
                {t('notificationSettings.leadChannel.label')}
              </Label>
              <p className="mt-1 mb-3 text-sm text-muted-foreground">
                {t('notificationSettings.leadChannel.description')}
              </p>
              <Select
                value={form.leadNotifyChannel ?? 'both'}
                onValueChange={(v) => updateForm({ leadNotifyChannel: v as LeadNotifyChannel })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_CHANNEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {t(`notificationSettings.leadChannel.${opt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </>
      )}
      <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
        <CardContent className="p-6 space-y-4">
          <Label className="text-base font-semibold">
            {t('notificationSettings.tariffChannel.label')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t('notificationSettings.tariffChannel.description')}
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm">{t('notificationSettings.tariffChannel.sms')}</span>
              <Switch
                checked={form.notifyTariffSms ?? true}
                onCheckedChange={(v) => updateForm({ notifyTariffSms: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm">{t('notificationSettings.tariffChannel.inApp')}</span>
              <Switch
                checked={form.notifyTariffInApp ?? true}
                onCheckedChange={(v) => updateForm({ notifyTariffInApp: v })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className={iconClass} />
              <h2 className="text-lg font-semibold">{t('notificationSettings.telegram.title')}</h2>
              <Badge variant={settings.telegramChatId ? 'default' : 'secondary'}>
                {settings.telegramChatId
                  ? t('notificationSettings.telegram.connected')
                  : t('notificationSettings.telegram.notConnected')}
              </Badge>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('notificationSettings.telegram.description')}
            </p>
            {isPremium &&
              (settings.telegramChatId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void save({ telegramChatId: null })}
                  disabled={isSaving}
                >
                  {t('notificationSettings.telegram.disconnect')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleConnectTelegram}
                  disabled={isCreatingLink}
                >
                  <ExternalLink className="mr-2 size-4" />
                  {isCreatingLink
                    ? t('notificationSettings.telegram.connecting')
                    : t('notificationSettings.telegram.connectButton')}
                </Button>
              ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Send className={iconClass} />
              <h2 className="text-lg font-semibold">{t('notificationSettings.whatsapp.title')}</h2>
              <Badge variant={settings.whatsappPhone ? 'default' : 'secondary'}>
                {settings.whatsappPhone
                  ? t('notificationSettings.whatsapp.connected')
                  : t('notificationSettings.whatsapp.notConnected')}
              </Badge>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('notificationSettings.whatsapp.description')}
            </p>
            <div className="space-y-2">
              <Label htmlFor="whatsappPhone">{t('notificationSettings.whatsapp.phoneLabel')}</Label>
              <Input
                id="whatsappPhone"
                value={form.whatsappPhone ?? ''}
                onChange={(e) => updateForm({ whatsappPhone: e.target.value || null })}
                placeholder={t('notificationSettings.whatsapp.phonePlaceholder')}
                disabled={!isPremium}
              />
              <p className="text-xs text-muted-foreground">
                {t('notificationSettings.whatsapp.phoneHelp')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? t('notificationSettings.saving') : t('notificationSettings.save')}
      </Button>
    </div>
  );
}
