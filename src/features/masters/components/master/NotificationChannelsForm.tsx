import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  masterCardStaticCls,
  masterFormLabelCls,
  masterPrimaryBtnCls,
  masterSelectTriggerCls,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { LEAD_NOTIFY_CHANNEL_INPUT } from '@/constants/leadNotifyChannel';

const iconClass = 'size-5';
const LEAD_CHANNEL_OPTIONS: LeadNotifyChannel[] = [
  LEAD_NOTIFY_CHANNEL_INPUT.telegram,
  LEAD_NOTIFY_CHANNEL_INPUT.none,
];
const POLL_INTERVAL_MS = 3000;
const POLL_DURATION_MS = 60000;

export function NotificationChannelsForm() {
  const { t } = useTranslation();
  const { isPro, settings, form, updateForm, save, isLoading, isSaving, refetch } =
    useNotificationSettings();
  const [createLink, { isLoading: isCreatingLink }] =
    useMastersCreateTelegramConnectLinkMutation();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSave = async () => {
    await save();
  };

  const handleConnectTelegram = useCallback(async () => {
    try {
      const result = await createLink().unwrap();
      const link = result?.link;
      if (!link) {
        toast.error(t('notificationSettings.telegram.connectError'));
        return;
      }
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

  const prevTelegramChatIdRef = useRef(settings.telegramChatId);
  useEffect(() => {
    if (settings.telegramChatId && !prevTelegramChatIdRef.current && pollRef.current) {
      toast.success(t('notificationSettings.telegram.connectedToast'));
    }
    prevTelegramChatIdRef.current = settings.telegramChatId;

    if (settings.telegramChatId && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [settings.telegramChatId, t]);

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      {isPro && (
        <>
          <div className={masterCardStaticCls}>
            <CardContent className="p-6">
              <Label className={masterFormLabelCls}>
                {t('notificationSettings.leadChannel.label')}
              </Label>
              <p className={cn('mb-3 mt-1', masterTextMuted)}>
                {t('notificationSettings.leadChannel.description')}
              </p>
              <Select
                value={form.leadNotifyChannel ?? LEAD_NOTIFY_CHANNEL_INPUT.telegram}
                onValueChange={(v) => updateForm({ leadNotifyChannel: v as LeadNotifyChannel })}
              >
                <SelectTrigger className={masterSelectTriggerCls}>
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
          </div>
        </>
      )}
      <div className={masterCardStaticCls}>
        <CardContent className="space-y-4 p-6">
          <Label className={masterFormLabelCls}>
            {t('notificationSettings.tariffChannel.label')}
          </Label>
          <p className={masterTextMuted}>
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
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className={masterCardStaticCls}>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className={cn(iconClass, 'text-[#E97525]')} />
              <h2 className={masterFormLabelCls}>{t('notificationSettings.telegram.title')}</h2>
              <Badge
                variant={settings.telegramChatId ? 'default' : 'outline'}
                className={settings.telegramChatId ? 'bg-emerald-600 hover:bg-emerald-600/80 text-white' : 'text-muted-foreground'}
              >
                {settings.telegramChatId
                  ? t('notificationSettings.telegram.connected')
                  : t('notificationSettings.telegram.notConnected')}
              </Badge>
            </div>
            <p className={cn('mb-4', masterTextMuted)}>
              {t('notificationSettings.telegram.description')}
            </p>
            {isPro &&
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
        </div>
      </div>

      <Button className={masterPrimaryBtnCls} onClick={handleSave} disabled={isSaving}>
        {isSaving ? t('notificationSettings.saving') : t('notificationSettings.save')}
      </Button>
    </div>
  );
}
