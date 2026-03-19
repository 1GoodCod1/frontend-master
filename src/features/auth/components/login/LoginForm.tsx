import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { AuthFormField } from '@/features/auth/components/AuthFormField';

interface LoginFormProps {
  isSubmitting: boolean;
}

export default function LoginForm({ isSubmitting }: LoginFormProps) {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);

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
      <AuthFormField
        name="password"
        label={t('auth.login.password')}
        type={showPass ? 'text' : 'password'}
        placeholder="••••••••"
        autoComplete="current-password"
        icon={<Lock size={15} />}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />
      <div className="-mt-1 flex justify-end">
        <RouterLink to="/forgot-password" className="auth-link">
          {t('auth.login.forgotPassword')}
        </RouterLink>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-primary-btn"
      >
        {isSubmitting ? '...' : t('auth.login.title')}
        <ArrowRight size={15} />
      </button>

      <div className="auth-divider text-center">
        <p className="mb-3 text-[0.82rem] text-muted-foreground">
          {t('auth.login.noAccount')}
        </p>
        <div className="flex flex-col gap-2">
          <RouterLink to="/register" className="auth-outline-btn inline-flex">
            {t('nav.register')}
          </RouterLink>
        </div>
      </div>
    </div>
  );
}
