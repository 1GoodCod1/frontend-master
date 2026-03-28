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
        <Card className="group relative overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm transition duration-300 hover:border-amber-500/30 hover:shadow-md dark:border-white/5 dark:bg-card/40 dark:hover:border-amber-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:from-amber-500/5 group-hover:to-transparent group-hover:opacity-100 pointer-events-none z-0" />
          <CardContent className="relative z-10 pt-6">
            <h2 className="mb-1 text-lg font-semibold">{t('security.changePassword')}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {t('security.changePasswordDescription')}
            </p>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm transition duration-300 hover:border-amber-500/30 hover:shadow-md dark:border-white/5 dark:bg-card/40 dark:hover:border-amber-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:from-amber-500/5 group-hover:to-transparent group-hover:opacity-100 pointer-events-none z-0" />
          <CardContent className="relative z-10 pt-6">
            <h2 className="mb-1 text-lg font-semibold">{t('security.loginHistory')}</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {t('security.loginHistoryDescription')}
            </p>
            <LoginHistory />
          </CardContent>
        </Card>
      </div>

      <Card className="group mt-6 relative overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm transition duration-300 hover:border-violet-500/30 hover:shadow-md dark:border-white/5 dark:bg-card/40 dark:hover:border-violet-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-violet-500/0 opacity-0 transition-opacity duration-300 group-hover:from-violet-500/5 group-hover:to-transparent group-hover:opacity-100 pointer-events-none z-0" />
        <div className="relative z-10 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{t('security.dataPrivacy')}</h2>
              <p className="text-sm text-muted-foreground">{t('security.dataPrivacyDescription')}</p>
            </div>
          </div>
        </div>
        <CardContent className="relative z-10 p-6">
          <AccountDataSection />
        </CardContent>
      </Card>
    </div>
  );
}
