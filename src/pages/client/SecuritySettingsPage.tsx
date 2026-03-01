import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { LoginHistory } from '@/components/security/LoginHistory';
import { ChangePasswordForm } from '@/components/security/ChangePasswordForm';

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
    </div>
  );
}
