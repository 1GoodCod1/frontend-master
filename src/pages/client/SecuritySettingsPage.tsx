import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { LoginHistory } from '@/features/security/components/LoginHistory';
import { ChangePasswordForm } from '@/features/security/components/ChangePasswordForm';
import { AccountDataSection } from '@/features/security/components/AccountDataSection';

export default function SecuritySettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl py-6 md:py-8">
      <PageHeader
        title={t('security.settingsTitle')}
        subtitle={t('security.subtitle')}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardContent className="pt-6">
            <h2 className="mb-1 text-lg font-semibold">{t('security.changePassword')}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {t('security.changePasswordDescription')}
            </p>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <h2 className="mb-1 text-lg font-semibold">{t('security.loginHistory')}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {t('security.loginHistoryDescription')}
            </p>
            <LoginHistory />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border">
        <div className="border-b border-border bg-muted/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{t('security.dataPrivacy')}</h2>
              <p className="text-sm text-muted-foreground">{t('security.dataPrivacyDescription')}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <AccountDataSection />
        </CardContent>
      </Card>
    </div>
  );
}
