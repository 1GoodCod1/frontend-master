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
        'fixed bottom-4 left-4 right-4 z-[1300] mx-auto flex max-w-[520px] flex-wrap items-center justify-between gap-4 rounded-xl p-4',
        'bg-white dark:bg-[hsl(var(--card))]',
        'border border-slate-200 dark:border-[hsl(var(--border))]',
        'text-slate-800 dark:text-[hsl(var(--card-foreground))]',
        'shadow-[0_10px_40px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)]'
      )}
    >
      <p className="min-w-[280px] flex-1 text-sm text-slate-600 dark:text-[hsl(var(--muted-foreground))]">
        {t('cookieConsent.message')}
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChoice('necessary')}
          className="border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:text-slate-800 dark:border-[hsl(var(--border))] dark:bg-[hsl(var(--secondary))] dark:text-[hsl(var(--foreground))] dark:hover:bg-[hsl(var(--muted))] dark:hover:text-[hsl(var(--foreground))]"
        >
          {t('cookieConsent.necessaryOnly')}
        </Button>
        <Button
          size="sm"
          onClick={() => handleChoice('all')}
          className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 shadow-md dark:bg-[#E97525] dark:text-white dark:hover:bg-[#f08a3d] dark:shadow-[0_4px_12px_rgba(233,117,37,0.35)]"
        >
          {t('cookieConsent.acceptAll')}
        </Button>
      </div>
    </div>
  );
}
