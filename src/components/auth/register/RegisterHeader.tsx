import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';

export default function RegisterHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-8 text-center">
      <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200/80 dark:from-amber-800/30 dark:to-amber-900/30 shadow-lg shadow-amber-900/10 transition-transform hover:scale-105">
        <UserPlus className="h-10 w-10 text-amber-700 dark:text-amber-600" strokeWidth={2} />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
        {t('auth.register.title')}
      </h1>
      <p className="mx-auto max-w-[480px] text-muted-foreground">
        {t('auth.registerClient.subtitle')}
      </p>
    </div>
  );
}
