import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

export default function ResetPasswordHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100/80 dark:bg-amber-800/30 shadow-md transition-all hover:scale-105 hover:shadow-lg">
        <Lock className="h-7 w-7 text-amber-700 dark:text-amber-600" strokeWidth={2} />
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-foreground md:text-3xl">
        {t('auth.resetPassword.title')}
      </h1>
      <p className="text-muted-foreground">
        {t('auth.resetPassword.subtitle')}
      </p>
    </div>
  );
}
