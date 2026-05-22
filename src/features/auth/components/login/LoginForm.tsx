import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { AuthFormField } from '@/features/auth/components/AuthFormField';
import { AuthGoogleButton } from '@/features/auth/components/AuthGoogleButton';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { env } from '@/services/env';

const apiBase = env.apiUrl.replace(/\/api\/v1\/?$/, '');

interface LoginFormProps {
  isSubmitting: boolean;
}

export default function LoginForm({ isSubmitting }: LoginFormProps) {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [rememberField, , rememberHelpers] = useField<boolean>('rememberMe');

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
      <div className="-mt-1 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-[0.82rem] text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={rememberField.value}
            onChange={(e) => rememberHelpers.setValue(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border accent-primary"
          />
          {t('auth.login.rememberMe')}
        </label>
        <RouterLink to="/forgot-password" className="auth-link">
          {t('auth.login.forgotPassword')}
        </RouterLink>
      </div>
      <button type="submit" disabled={isSubmitting} className="auth-primary-btn">
        {isSubmitting ? '...' : t('auth.login.title')}
        <ArrowRight size={15} />
      </button>

      <AuthDivider />
      <AuthGoogleButton href={`${apiBase}/api/v1/auth/google`}>
        {t('auth.social.loginGoogle')}
      </AuthGoogleButton>

      <p className="auth-footer-text">
        {t('auth.login.noAccount')}{' '}
        <RouterLink to="/register" className="auth-link">
          {t('nav.register')}
        </RouterLink>
      </p>
    </div>
  );
}
