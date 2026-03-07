import { useTranslation } from 'react-i18next';

export default function RegisterHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-3">
      <p className="auth-section-label">{t('auth.register.sectionLabel')}</p>
      <h1 className="auth-heading">{t('auth.register.heading')}</h1>
      <p className="auth-subheading !mb-0">{t('auth.register.sub')}</p>
    </div>
  );
}
