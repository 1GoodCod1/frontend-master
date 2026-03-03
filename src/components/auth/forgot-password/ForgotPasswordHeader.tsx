import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <Link to="/login" className="auth-back-link">
        <ChevronLeft size={14} />
        {t('auth.login.backToLogin')}
      </Link>
      <p className="auth-section-label">{t('auth.forgotPassword.sectionLabel')}</p>
      <h1 className="auth-heading">{t('auth.forgotPassword.heading')}</h1>
      <p className="auth-subheading">{t('auth.forgotPassword.sub')}</p>
    </div>
  );
}
