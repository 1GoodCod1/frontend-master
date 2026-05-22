import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthFormField } from '@/features/auth/components/AuthFormField';

interface ForgotPasswordFormProps {
  isSubmitting: boolean;
}

export default function ForgotPasswordForm({ isSubmitting }: ForgotPasswordFormProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <AuthFormField
        name="email"
        label={t('auth.login.email')}
        type="email"
        placeholder="example@mail.com"
        autoComplete="email"
        icon={<Mail size={15} />}
      />
      <button type="submit" disabled={isSubmitting} className="auth-primary-btn">
        {isSubmitting ? '...' : t('auth.forgotPassword.submit')}
        <ArrowRight size={15} />
      </button>

      <p className="auth-footer-text">
        {t('auth.forgotPassword.rememberPassword')}{' '}
        <RouterLink to="/login" className="auth-link">
          {t('auth.login.title')}
        </RouterLink>
      </p>
    </div>
  );
}
