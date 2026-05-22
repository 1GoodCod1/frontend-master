import { useTranslation } from 'react-i18next';
import { AuthNavTabs } from '@/features/auth/components/AuthNavTabs';

export default function RegisterHeader() {
  const { t } = useTranslation();

  return (
    <header className="auth-form-header auth-form-header--compact">
      <AuthNavTabs />
      <h1 className="auth-heading">{t('auth.register.heading')}</h1>
      <p className="auth-subheading !mb-0">{t('auth.register.sub')}</p>
    </header>
  );
}
