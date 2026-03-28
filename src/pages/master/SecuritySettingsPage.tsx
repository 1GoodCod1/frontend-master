import { useTranslation } from 'react-i18next';
import { Lock, History, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { LoginHistory } from '@/features/security/components/LoginHistory';
import { ChangePasswordForm } from '@/features/security/components/ChangePasswordForm';
import { AccountDataSection } from '@/features/security/components/AccountDataSection';

const cardClass =
  'overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition duration-300';

const headerClass =
  'border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5';

export default function SecuritySettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader
          title={t('security.settingsTitle')}
          subtitle={t('security.subtitle')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className={cardClass}>
          <div className={headerClass}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-500">
                <Lock className="size-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('security.changePassword')}</h2>
            </div>
          </div>
          <CardContent className="p-6">
            <p className="mb-6 text-sm text-muted-foreground">
              {t('security.changePasswordDescription')}
            </p>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <div className={headerClass}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-500">
                <History className="size-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('security.loginHistory')}</h2>
            </div>
          </div>
          <CardContent className="p-6">
            <p className="mb-6 text-sm text-muted-foreground">
              {t('security.loginHistoryDescription')}
            </p>
            <LoginHistory />
          </CardContent>
        </Card>
      </div>

      <Card className={`mt-6 ${cardClass}`}>
        <div className={headerClass}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('security.dataPrivacy')}</h2>
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
