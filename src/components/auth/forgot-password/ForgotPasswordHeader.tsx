import { useTranslation } from 'react-i18next';
import { KeyRound } from 'lucide-react';

export default function ForgotPasswordHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100/80 dark:bg-amber-800/30 shadow-md transition-all hover:scale-105 hover:shadow-lg">
        <KeyRound className="h-8 w-8 text-amber-700 dark:text-amber-600" strokeWidth={2} />
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-foreground md:text-3xl">
        {t('auth.forgotPassword.title')}
      </h1>
      <p className="text-muted-foreground">
        {t('auth.forgotPassword.subtitle')}
      </p>
    </div>
  );
}
