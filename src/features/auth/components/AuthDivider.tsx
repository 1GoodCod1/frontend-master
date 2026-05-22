import { useTranslation } from 'react-i18next';

export function AuthDivider() {
  const { t } = useTranslation();

  return (
    <div className="auth-or-divider">
      <span>{t('auth.social.orDivider')}</span>
    </div>
  );
}
