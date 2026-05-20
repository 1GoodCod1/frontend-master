import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardContent } from '@/components/ui/card';
import { LoginHistory } from '@/features/security/components/LoginHistory';
import { ChangePasswordForm } from '@/features/security/components/ChangePasswordForm';
import { AccountDataSection } from '@/features/security/components/AccountDataSection';
import { cn } from '@/lib/utils';
import {
  masterCardStaticCls,
  masterIconWrapCls,
  masterPageClassName,
  masterSectionTitleCls,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';

export default function SecuritySettingsPage() {
  const { t } = useTranslation();

  return (
    <div className={masterPageClassName}>
      <PageHeader
        title={t('security.settingsTitle')}
        subtitle={t('security.subtitle')}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className={masterCardStaticCls}>
          <CardContent className="pt-6">
            <h2 className={cn('mb-1', masterSectionTitleCls)}>{t('security.changePassword')}</h2>
            <p className={cn('mb-6', masterTextMuted)}>{t('security.changePasswordDescription')}</p>
            <ChangePasswordForm />
          </CardContent>
        </div>

        <div className={masterCardStaticCls}>
          <CardContent className="pt-6">
            <h2 className={cn('mb-1', masterSectionTitleCls)}>{t('security.loginHistory')}</h2>
            <p className={cn('mb-6', masterTextMuted)}>{t('security.loginHistoryDescription')}</p>
            <LoginHistory />
          </CardContent>
        </div>
      </div>

      <div className={cn(masterCardStaticCls, 'mt-2 overflow-hidden')}>
        <div className="border-b border-[#e8e8e8] bg-[hsl(var(--secondary)/0.35)] px-6 py-5 dark:border-[#2d2d2d] dark:bg-white/[0.03]">
          <div className="flex items-center gap-4">
            <span className={masterIconWrapCls}>
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className={masterSectionTitleCls}>{t('security.dataPrivacy')}</h2>
              <p className={masterTextMuted}>{t('security.dataPrivacyDescription')}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <AccountDataSection />
        </CardContent>
      </div>
    </div>
  );
}
