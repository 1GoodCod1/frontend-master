import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordHeader() {
  const { t } = useTranslation();

  return (
    <header className="auth-form-header">
      <Link to="/login" className="auth-back-link">
        <ArrowLeft size={15} strokeWidth={2.25} />
        {t('auth.login.backToLogin')}
      </Link>
      <h1 className="auth-heading">{t('auth.forgotPassword.heading')}</h1>
      <p className="auth-subheading">{t('auth.forgotPassword.sub')}</p>
    </header>
  );
}
