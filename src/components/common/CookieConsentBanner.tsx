import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  hasConsent,
  setCookieConsent,
  type CookieConsentChoice,
} from '@/features/cookie-consent/storage';
import { prefsCookies } from '@/utils/prefsCookies';
import { store } from '@/app/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CookieConsentBanner() {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(() => !hasConsent());

  const handleChoice = (choice: CookieConsentChoice) => {
    setCookieConsent(choice);
    if (choice === 'all') {
      const lang = i18n.language || 'ro';
      if (['en', 'ru', 'ro'].includes(lang)) prefsCookies.lang.set(lang);
      const theme = store.getState().ui?.colorMode || 'light';
      prefsCookies.theme.set(theme);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-[1300] mx-auto flex max-w-[520px] flex-wrap items-center justify-between gap-4 rounded-xl p-4 shadow-xl',
        'bg-white border border-slate-200 text-slate-800',
        'dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100'
      )}
    >
      <p className="min-w-[280px] flex-1 text-sm text-slate-700 dark:text-slate-200">
        {t('cookieConsent.message')}
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChoice('necessary')}
          className="border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {t('cookieConsent.necessaryOnly')}
        </Button>
        <Button
          size="sm"
          onClick={() => handleChoice('all')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90"
        >
          {t('cookieConsent.acceptAll')}
        </Button>
      </div>
    </div>
  );
}
