import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthFormField } from '@/components/auth/AuthFormField';

interface ForgotPasswordFormProps {
  isSubmitting: boolean;
}

export default function ForgotPasswordForm({
  isSubmitting,
}: ForgotPasswordFormProps) {
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-primary-btn"
      >
        {isSubmitting ? '...' : t('auth.forgotPassword.submit')}
        <ArrowRight size={15} />
      </button>
      <div className="auth-divider text-center">
        <p className="mb-3 text-[0.82rem] text-[#6b6b6b] dark:text-[#7a7a7a]">
          {t('auth.forgotPassword.rememberPassword')}
        </p>
        <RouterLink to="/login" className="auth-outline-btn inline-flex">
          {t('auth.login.title')}
        </RouterLink>
      </div>
    </div>
  );
}
