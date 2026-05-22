import { useTranslation } from 'react-i18next';
import { AuthNavTabs } from '@/features/auth/components/AuthNavTabs';

export default function LoginHeader() {
  const { t } = useTranslation();

  return (
    <header className="auth-form-header">
      <AuthNavTabs />
      <h1 className="auth-heading">{t('auth.login.welcomeHeading')}</h1>
      <p className="auth-subheading">{t('auth.login.welcomeSub')}</p>
    </header>
  );
}
