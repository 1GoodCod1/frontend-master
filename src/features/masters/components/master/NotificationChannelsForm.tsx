import { useTranslation } from 'react-i18next';
import { MessageCircle, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNotificationSettings } from '@/hooks/master/useNotificationSettings';

const iconClass = 'size-5';

export function NotificationChannelsForm() {
  const { t } = useTranslation();
  const { isPremium, settings, form, updateForm, save, isLoading, isSaving } =
    useNotificationSettings();

  const handleSave = async () => {
    await save();
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
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
            <div className="space-y-2">
              <Label htmlFor="telegramChatId">{t('notificationSettings.telegram.chatIdLabel')}</Label>
              <Input
                id="telegramChatId"
                value={form.telegramChatId ?? ''}
                onChange={(e) => updateForm({ telegramChatId: e.target.value || null })}
                placeholder={t('notificationSettings.telegram.chatIdPlaceholder')}
                disabled={!isPremium}
              />
              <p className="text-xs text-muted-foreground">
                {t('notificationSettings.telegram.chatIdHelp')}
              </p>
            </div>
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

      {isPremium && (
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? t('notificationSettings.saving') : t('notificationSettings.save')}
        </Button>
      )}
    </div>
  );
}
