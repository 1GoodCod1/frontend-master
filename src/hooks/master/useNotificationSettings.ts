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

  const settings = data ?? {
    telegramChatId: null,
    whatsappPhone: null,
    leadNotifyChannel: 'both',
    notifyTariffSms: true,
    notifyTariffInApp: true,
  };

  const [form, setForm] = useState<UpdateNotificationSettingsDto>({
    telegramChatId: settings.telegramChatId ?? null,
    whatsappPhone: settings.whatsappPhone ?? null,
    leadNotifyChannel: (settings.leadNotifyChannel as UpdateNotificationSettingsDto['leadNotifyChannel']) ?? 'both',
    notifyTariffSms: settings.notifyTariffSms ?? true,
    notifyTariffInApp: settings.notifyTariffInApp ?? true,
  });

  useEffect(() => {
    if (!data) return;
    queueMicrotask(() => {
      setForm({
        telegramChatId: data.telegramChatId ?? null,
        whatsappPhone: data.whatsappPhone ?? null,
        leadNotifyChannel: (data.leadNotifyChannel as UpdateNotificationSettingsDto['leadNotifyChannel']) ?? 'both',
        notifyTariffSms: data.notifyTariffSms ?? true,
        notifyTariffInApp: data.notifyTariffInApp ?? true,
      });
    });
  }, [data]);

  const updateForm = (partial: UpdateNotificationSettingsDto) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const save = async (overrides?: Partial<UpdateNotificationSettingsDto>) => {
    if (!isPremium) return;
    try {
      await update({ ...form, ...overrides }).unwrap();
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
