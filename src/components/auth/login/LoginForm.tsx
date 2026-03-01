import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  isSubmitting: boolean;
}

export default function LoginForm({ isSubmitting }: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <FormikTextField
        name="email"
        label={t('auth.login.email')}
        autoComplete="email"
        fullWidth
      />
      <FormikTextField
        name="password"
        label={t('auth.login.password')}
        type="password"
        autoComplete="current-password"
        fullWidth
      />
      <div className="mb-1 text-right">
        <RouterLink
          to="/forgot-password"
          className="text-sm font-semibold text-amber-700 dark:text-amber-600 underline underline-offset-2 decoration-amber-600/60 hover:decoration-amber-600 dark:decoration-amber-600/60 dark:hover:decoration-amber-500 transition-colors"
        >
          {t('auth.login.forgotPassword')}
        </RouterLink>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full py-6 text-base font-semibold rounded-lg shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
      >
        {isSubmitting ? '...' : t('auth.login.title')}
      </Button>
      <div className="mt-6 border-t border-border dark:border-white/[0.08] pt-6 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          {t('auth.login.noAccount')}
        </p>
        <RouterLink
          to="/register"
          className="inline-flex items-center justify-center rounded-lg h-11 px-5 py-2 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
        >
          {t('nav.register')}
        </RouterLink>
      </div>
    </div>
  );
}
