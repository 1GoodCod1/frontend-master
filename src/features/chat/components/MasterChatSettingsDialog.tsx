import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, MessageSquareMore, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { AutoresponderSettings, QuickReply } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  quickReplies: QuickReply[];
  autoresponder?: AutoresponderSettings;
  isSavingQuickReplies?: boolean;
  isSavingAutoresponder?: boolean;
  onSaveQuickReplies: (items: Array<{ text: string; order?: number }>) => Promise<void> | void;
  onSaveAutoresponder: (input: { enabled?: boolean; message?: string | null }) => Promise<void> | void;
};

type DraftReply = { key: string; text: string };

export function MasterChatSettingsDialog(props: Props) {
  const { t } = useTranslation();
  const {
    open,
    onClose,
    quickReplies,
    autoresponder,
    isSavingQuickReplies,
    isSavingAutoresponder,
    onSaveQuickReplies,
    onSaveAutoresponder,
  } = props;

  const initialReplies = useMemo<DraftReply[]>(
    () => quickReplies.map((r) => ({ key: r.id, text: r.text })),
    [quickReplies],
  );

  const [tab, setTab] = useState<'templates' | 'autoresponder'>('templates');
  const [draftReplies, setDraftReplies] = useState<DraftReply[]>(initialReplies);
  const [autoEnabled, setAutoEnabled] = useState<boolean>(autoresponder?.autoresponderEnabled ?? false);
  const [autoMessage, setAutoMessage] = useState<string>(autoresponder?.autoresponderMessage ?? '');

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setTab('templates');
      setDraftReplies(initialReplies);
      setAutoEnabled(autoresponder?.autoresponderEnabled ?? false);
      setAutoMessage(autoresponder?.autoresponderMessage ?? '');
    });
  }, [open, initialReplies, autoresponder?.autoresponderEnabled, autoresponder?.autoresponderMessage]);

  const move = (from: number, to: number) => {
    setDraftReplies((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const removeAt = (idx: number) =>
    setDraftReplies((prev) => prev.filter((_, i) => i !== idx));

  const addEmpty = () =>
    setDraftReplies((prev) => [
      ...prev,
      { key: `new-${Date.now()}-${Math.random().toString(16).slice(2)}`, text: '' },
    ]);

  const saveReplies = async () => {
    const cleaned = draftReplies
      .map((r) => r.text.trim())
      .filter(Boolean)
      .slice(0, 30)
      .map((text, order) => ({ text, order }));
    await onSaveQuickReplies(cleaned);
  };

  const saveAutoresponder = async () => {
    await onSaveAutoresponder({
      enabled: autoEnabled,
      message: autoMessage.trim() ? autoMessage : null,
    });
  };

  const handleOpenChange = (v: boolean) => {
    if (!v && !isSavingQuickReplies && !isSavingAutoresponder) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[calc(100vw-2rem)] sm:max-w-2xl rounded-2xl"
        onPointerDownOutside={(e) => (isSavingQuickReplies || isSavingAutoresponder) && e.preventDefault()}
        onEscapeKeyDown={(e) => (isSavingQuickReplies || isSavingAutoresponder) && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <MessageSquareMore className="size-4" />
            </div>
            {t('chat.settings', 'Настройки чата')}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'templates' | 'autoresponder')}>
            <TabsList className="w-full">
              <TabsTrigger value="templates" className="flex-1">
                {t('chat.quickReplies', 'Шаблоны')}
              </TabsTrigger>
              <TabsTrigger value="autoresponder" className="flex-1">
                {t('chat.autoresponder', 'Автоответчик')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {t('chat.quickRepliesHint', 'Быстрые ответы для чата. Нажмите в чате — текст подставится в сообщение.')}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={addEmpty} className="shrink-0 gap-2">
                  <Plus className="size-4" />
                  {t('common.add', 'Добавить')}
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {draftReplies.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    {t('chat.noQuickReplies', 'Пока нет шаблонов. Добавьте первый.')}
                  </div>
                )}
                {draftReplies.map((r, idx) => (
                  <div
                    key={r.key}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-2 dark:border-white/[0.08] dark:bg-white/[0.03]"
                  >
                    <div className="flex w-14 shrink-0 items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={idx === 0}
                        onClick={() => move(idx, idx - 1)}
                        aria-label={t('common.moveUp', 'Вверх')}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={idx === draftReplies.length - 1}
                        onClick={() => move(idx, idx + 1)}
                        aria-label={t('common.moveDown', 'Вниз')}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </div>

                    <Input
                      value={r.text}
                      onChange={(e) =>
                        setDraftReplies((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, text: e.target.value } : it)),
                        )
                      }
                      placeholder={t('chat.quickReplyPlaceholder', 'Например: Спасибо за обращение! Свободен в...')}
                      maxLength={500}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => removeAt(idx)}
                      aria-label={t('common.remove', 'Удалить')}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={Boolean(isSavingQuickReplies)}>
                  {t('common.cancel', 'Отмена')}
                </Button>
                <Button type="button" onClick={saveReplies} disabled={Boolean(isSavingQuickReplies)} className="bg-amber-600 hover:bg-amber-700">
                  {isSavingQuickReplies ? t('common.saving', 'Сохраняю...') : t('common.save', 'Сохранить')}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="autoresponder" className="mt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold">{t('chat.autoresponderTitle', 'Автоответчик вне рабочих часов')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('chat.autoresponderHint', 'Если клиент напишет ночью/вне графика, он получит автоответ один раз за время.')}
                  </p>
                  {autoresponder && (
                    <p className="text-xs text-muted-foreground">
                      {t('chat.workHours', 'Ваши часы')}: {autoresponder.workStartHour}:00 – {autoresponder.workEndHour}:00
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={autoEnabled} onCheckedChange={setAutoEnabled} />
                  <span className={cn('text-sm font-medium', autoEnabled ? 'text-foreground' : 'text-muted-foreground')}>
                    {autoEnabled ? t('common.enabled', 'Включён') : t('common.disabled', 'Выключен')}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Textarea
                  value={autoMessage}
                  onChange={(e) => setAutoMessage(e.target.value)}
                  placeholder={t('chat.autoresponderPlaceholder', 'Например: Спасибо! Отвечу завтра после 9:00.')}
                  className="min-h-[110px]"
                  maxLength={1000}
                  disabled={!autoEnabled}
                />
                <p className="text-xs text-muted-foreground">
                  {autoMessage.length}/1000
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={Boolean(isSavingAutoresponder)}>
                  {t('common.cancel', 'Отмена')}
                </Button>
                <Button type="button" onClick={saveAutoresponder} disabled={Boolean(isSavingAutoresponder)} className="bg-amber-600 hover:bg-amber-700">
                  {isSavingAutoresponder ? t('common.saving', 'Сохраняю...') : t('common.save', 'Сохранить')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

