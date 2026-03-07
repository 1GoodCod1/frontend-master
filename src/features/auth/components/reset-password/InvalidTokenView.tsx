import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

export default function InvalidTokenView() {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100/80 dark:bg-amber-800/30 shadow-md">
          <Lock className="h-7 w-7 text-amber-700 dark:text-amber-600" strokeWidth={2} />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground md:text-3xl">
          {t('auth.resetPassword.title')}
        </h1>
        <p className="mb-6 text-muted-foreground">
          {t('auth.resetPassword.invalidToken')}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <RouterLink
          to="/forgot-password"
          className="inline-flex w-full items-center justify-center rounded-lg h-12 px-5 py-2 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
        >
          {t('auth.forgotPassword.title')}
        </RouterLink>
        <div className="text-center">
          <RouterLink
            to="/login"
            className="inline-flex items-center justify-center rounded-lg h-11 px-5 py-2 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
          >
            {t('auth.login.title')}
          </RouterLink>
        </div>
      </div>
    </>
  );
}
