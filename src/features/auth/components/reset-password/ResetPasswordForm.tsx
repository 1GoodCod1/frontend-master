import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { Button } from '@/components/ui/button';

interface ResetPasswordFormProps {
  isSubmitting: boolean;
}

export default function ResetPasswordForm({
  isSubmitting,
}: ResetPasswordFormProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <FormikTextField
        name="password"
        label={t('auth.register.password')}
        type="password"
        autoComplete="new-password"
        fullWidth
      />
      <FormikTextField
        name="confirmPassword"
        label={t('auth.resetPassword.confirmPassword')}
        type="password"
        autoComplete="new-password"
        fullWidth
      />
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full py-6 text-base font-semibold rounded-lg shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
      >
        {isSubmitting ? '...' : t('auth.resetPassword.submit')}
      </Button>
      <div className="mt-6 border-t border-border dark:border-white/[0.08] pt-6 text-center">
        <RouterLink
          to="/login"
          className="inline-flex items-center justify-center rounded-lg h-11 px-5 py-2 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
        >
          {t('auth.login.title')}
        </RouterLink>
      </div>
    </div>
  );
}
