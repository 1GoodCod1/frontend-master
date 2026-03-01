import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  useMastersGetNotificationSettingsQuery,
  useMastersUpdateNotificationSettingsMutation,
} from '@/features/masters/mastersApi';
import { useAppSelector } from '@/app/hooks';
import { selectPlan } from '@/features/auth/selectors';
import { hasMinPlan } from '@/features/auth/plan';
import type { UpdateNotificationSettingsDto } from '@/types';

export function useNotificationSettings() {
  const { t } = useTranslation();
  const plan = useAppSelector(selectPlan) ?? 'BASIC';
  const isPremium = hasMinPlan(plan, 'VIP');

  const { data, isLoading, isError, refetch } = useMastersGetNotificationSettingsQuery();

  const [update, updateState] = useMastersUpdateNotificationSettingsMutation();

  const settings = data ?? { telegramChatId: null, whatsappPhone: null };

  const [form, setForm] = useState<UpdateNotificationSettingsDto>({
    telegramChatId: settings.telegramChatId ?? null,
    whatsappPhone: settings.whatsappPhone ?? null,
  });

  useEffect(() => {
    if (!data) return;
    queueMicrotask(() => {
      setForm({
        telegramChatId: data.telegramChatId ?? null,
        whatsappPhone: data.whatsappPhone ?? null,
      });
    });
  }, [data]);

  const updateForm = (partial: UpdateNotificationSettingsDto) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const save = async () => {
    if (!isPremium) return;
    try {
      await update({ ...form }).unwrap();
      toast.success(t('notificationSettings.saved'));
      refetch();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message;
      toast.error(msg || t('notificationSettings.saveError'));
    }
  };

  return {
    plan,
    isPremium,
    settings,
    form,
    updateForm,
    save,
    isLoading,
    isError,
    isSaving: updateState.isLoading,
    refetch,
  };
}
