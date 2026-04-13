import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Megaphone, FileCode2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAdminDigestStatsQuery,
  useAdminDigestSubscribersQuery,
  useAdminUnsubscribeDigestMutation,
  useAdminBroadcastTemplatesQuery,
  useAdminSendBroadcastMutation,
  useAdminDigestAnnouncementQuery,
  useAdminSetDigestAnnouncementMutation,
  useAdminTemplateIdsQuery,
  useAdminTemplateDefaultQuery,
  useAdminTemplateOverridesQuery,
  useAdminSetTemplateOverrideMutation,
} from '@/features/admin/adminApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { getLocaleFromLanguage } from '@/utils/date';
import { TemplateOverrideForm } from './digest/TemplateOverrideForm';
import { DigestSubscribersSection } from './digest/DigestSubscribersSection';
import { BROADCAST_SEGMENTS, TEMPLATE_OVERRIDE_FALLBACK } from '@/constants/digestAdmin';

export default function DigestAdminPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [subPage, setSubPage] = useState(1);
  const [unsubscribeUserId, setUnsubscribeUserId] = useState<string | null>(null);
  const [broadcastSegment, setBroadcastSegment] = useState('all_masters');
  const [broadcastTemplate, setBroadcastTemplate] = useState<string>('');
  const [announcementDraft, setAnnouncementDraft] = useState<string | null>(null);
  const [overrideEdit, setOverrideEdit] = useState<{ templateId: string; lang: string } | null>(null);

  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErr, refetch: refetchStats } =
    useAdminDigestStatsQuery();
  const { data: subscribers, isLoading: subsLoading, refetch: refetchSubs } =
    useAdminDigestSubscribersQuery({ page: subPage, limit: 20 });
  const { data: templates, isLoading: templatesLoading } = useAdminBroadcastTemplatesQuery();
  const { data: templateIds = [] } = useAdminTemplateIdsQuery();
  const { data: announcement = '' } = useAdminDigestAnnouncementQuery();
  const { data: overrides = [] } = useAdminTemplateOverridesQuery();
  const currentOverrideForEdit = overrideEdit
    ? overrides.find((o) => o.templateId === overrideEdit.templateId && o.lang === overrideEdit.lang)
    : null;
  const { data: templateDefault, isLoading: defaultLoading } = useAdminTemplateDefaultQuery(
    overrideEdit
      ? { templateId: overrideEdit.templateId, lang: overrideEdit.lang }
      : { templateId: '', lang: '' },
    { skip: !overrideEdit || !!currentOverrideForEdit },
  );

  const [setAnnouncement, { isLoading: isSavingAnnouncement }] = useAdminSetDigestAnnouncementMutation();
  const [setOverride, { isLoading: isSavingOverride }] = useAdminSetTemplateOverrideMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] = useAdminUnsubscribeDigestMutation();
  const [sendBroadcast, { isLoading: isBroadcasting }] = useAdminSendBroadcastMutation();

  const isLoading = statsLoading;
  const isError = statsError;
  const error = statsErr;
  const refetch = () => {
    refetchStats();
    refetchSubs();
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  const subscriberCount = stats?.subscriberCount ?? 0;
  const items = subscribers?.items ?? [];
  const meta = subscribers?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 };
  const templateList = templates ?? [];
  const defaultTemplate = templateList.includes('new-feature-masters') ? 'new-feature-masters' : templateList[0] ?? '';
  const selectedTemplate = broadcastTemplate || defaultTemplate;
  const announcementValue = announcementDraft !== null ? announcementDraft : announcement;

  const handleSaveAnnouncement = async () => {
    try {
      await setAnnouncement(announcementValue).unwrap();
      setAnnouncementDraft(null);
      toast.success(t('admin.digest.announcementSaved'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleSaveOverride = async (subject: string, bodyHtml: string) => {
    if (!overrideEdit) return;
    try {
      await setOverride({
        templateId: overrideEdit.templateId,
        lang: overrideEdit.lang,
        subject: subject || undefined,
        bodyHtml: bodyHtml || undefined,
      }).unwrap();
      toast.success(t('admin.digest.overrideSaved'));
      setOverrideEdit(null);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleUnsubscribe = async () => {
    if (!unsubscribeUserId) return;
    try {
      await unsubscribe(unsubscribeUserId).unwrap();
      toast.success(t('admin.digest.unsubscribed'));
      setUnsubscribeUserId(null);
      refetch();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleBroadcast = async () => {
    if (!selectedTemplate) {
      toast.error(t('admin.digest.selectTemplate'));
      return;
    }
    try {
      const result = await sendBroadcast({
        segment: broadcastSegment,
        templateName: selectedTemplate,
        ...(broadcastSegment === 'new_masters'
          ? { sinceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) }
          : {}),
      }).unwrap();
      const d = (result as { data?: { total?: number; sent?: number; failed?: number } })?.data;
      const sent = d?.sent ?? 0;
      const total = d?.total ?? 0;
      toast.success(
        t('admin.digest.broadcastSuccess', { sent, total, defaultValue: `Отправлено: {{sent}} из {{total}}` }),
      );
      refetch();
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <>
      <PageHeader
        title={t('admin.digest.title', 'Digest')}
        subtitle={t('admin.digest.subtitle', 'Управление подпиской на дайджест')}
      />

      <SectionCard
        title={t('admin.digest.announcementTitle', 'Анонс в дайджесте')}
        subtitle={t(
          'admin.digest.announcementSubtitle',
          'Текст показывается подписчикам в каждом дайджесте. Оставьте пустым, чтобы скрыть блок.',
        )}
      >
        <div className="space-y-3">
          <Textarea
            value={announcementValue}
            onChange={(e) => setAnnouncementDraft(e.target.value)}
            placeholder={t('admin.digest.announcementPlaceholder', 'Например: Вышла новая функция — бронирование онлайн!')}
            rows={3}
            className="resize-none"
          />
          <Button onClick={handleSaveAnnouncement} disabled={isSavingAnnouncement}>
            {isSavingAnnouncement ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title={t('admin.digest.stats', 'Статистика')}>
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Mail className="size-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{subscriberCount}</p>
            <p className="text-sm text-muted-foreground">
              {t('admin.digest.subscribers', 'Подписчиков на дайджест')}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={t('admin.digest.broadcastTitle', 'Рассылка по сегментам')}
        subtitle={t(
          'admin.digest.broadcastSubtitle',
          'Например: анонс новой функции для мастеров — выберите «Все мастера» и шаблон new-feature-masters',
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">{t('admin.digest.segment', 'Сегмент')}</label>
            <Select value={broadcastSegment} onValueChange={setBroadcastSegment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BROADCAST_SEGMENTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {t(s.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">{t('admin.digest.template', 'Шаблон')}</label>
            <Select
              value={selectedTemplate || templateList[0] || ''}
              onValueChange={setBroadcastTemplate}
              disabled={templatesLoading || templateList.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('admin.digest.selectTemplate', 'Выберите шаблон')} />
              </SelectTrigger>
              <SelectContent>
                {templateList.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleBroadcast}
            disabled={isBroadcasting || !selectedTemplate}
            className="gap-2 shrink-0"
          >
            {isBroadcasting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Megaphone className="size-4" />
            )}
            {t('admin.digest.sendBroadcast', 'Отправить')}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title={t('admin.digest.templateOverridesTitle', 'Переопределение шаблонов')}
        subtitle={t(
          'admin.digest.templateOverridesSubtitle',
          'Изменить subject или HTML для шаблона и языка. Переопределение заменяет файловый шаблон.',
        )}
        icon={<FileCode2 className="size-5" />}
      >
        <div className="space-y-4">
          {!overrideEdit ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {overrides.map((o) => (
                  <Button
                    key={`${o.templateId}-${o.lang}`}
                    variant="outline"
                    size="sm"
                    onClick={() => setOverrideEdit({ templateId: o.templateId, lang: o.lang })}
                    className="font-mono text-xs"
                  >
                    {o.templateId} ({o.lang})
                  </Button>
                ))}
                <div className="h-6 w-px bg-border" />
                <Select
                  onValueChange={(v) => {
                    if (v) {
                      const [tid, l] = v.split(':');
                      if (tid && l) setOverrideEdit({ templateId: tid, lang: l });
                    }
                  }}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={t('admin.digest.addOverride', 'Добавить override')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(templateIds.length > 0 ? templateIds : TEMPLATE_OVERRIDE_FALLBACK).flatMap((tid) =>
                      (['en', 'ru', 'ro'] as const).map((l) => (
                        <SelectItem key={`${tid}-${l}`} value={`${tid}:${l}`}>
                          {tid} ({l})
                        </SelectItem>
                      )),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {overrides.length === 0
                  ? t('admin.digest.noOverrides', 'Нет переопределений. Выберите шаблон и язык выше.')
                  : t('admin.digest.clickToEdit', 'Нажмите на override для редактирования.')}
              </p>
            </>
          ) : defaultLoading && !currentOverrideForEdit ? (
            <p className="py-8 text-center text-muted-foreground">{t('common.loading')}</p>
          ) : (
            <TemplateOverrideForm
              key={`${overrideEdit.templateId}-${overrideEdit.lang}`}
              templateId={overrideEdit.templateId}
              lang={overrideEdit.lang}
              initialSubject={currentOverrideForEdit?.subject ?? templateDefault?.subject ?? ''}
              initialBodyHtml={currentOverrideForEdit?.bodyHtml ?? templateDefault?.bodyHtml ?? ''}
              onSave={handleSaveOverride}
              onCancel={() => setOverrideEdit(null)}
              isSaving={isSavingOverride}
              t={t}
            />
          )}
        </div>
      </SectionCard>

      <DigestSubscribersSection
        subsLoading={subsLoading}
        items={items}
        meta={meta}
        locale={locale}
        isUnsubscribing={isUnsubscribing}
        onUnsubscribeClick={setUnsubscribeUserId}
        onPrevPage={() => setSubPage((p) => Math.max(1, p - 1))}
        onNextPage={() => setSubPage((p) => p + 1)}
      />

      <AlertDialog open={!!unsubscribeUserId} onOpenChange={() => setUnsubscribeUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.digest.unsubscribeConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.digest.unsubscribeConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnsubscribe}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('admin.digest.unsubscribe', 'Отписать')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
