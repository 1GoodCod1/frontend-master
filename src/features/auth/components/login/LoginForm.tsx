import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { AuthFormField } from '@/features/auth/components/AuthFormField';
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-primary-btn"
      >
        {isSubmitting ? '...' : t('auth.login.title')}
        <ArrowRight size={15} />
      </button>

      {/* Social: без ?role= — бэкенд при уже привязанном Google сразу логинит; новый пользователь выберет роль на /complete-profile */}
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[0.75rem] text-muted-foreground">{t('auth.social.orDivider')}</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <a
          href={`${apiBase}/api/v1/auth/google`}
          className="auth-outline-btn inline-flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          {t('auth.social.loginGoogle')}
        </a>
      </div>

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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

