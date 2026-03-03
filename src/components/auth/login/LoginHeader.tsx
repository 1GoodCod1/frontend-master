import { useTranslation } from 'react-i18next';

export default function LoginHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <p className="auth-section-label">{t('auth.login.title').toUpperCase()}</p>
      <h1 className="auth-heading">{t('auth.login.welcomeHeading')}</h1>
      <p className="auth-subheading">{t('auth.login.welcomeSub')}</p>
    </div>
  );
}
