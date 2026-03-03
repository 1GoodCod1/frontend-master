import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, UserPlus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { AppShellNavItem } from './types';
import type { SupportedLanguage } from './types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: AppShellNavItem[];
  isAuthed: boolean;
  colorMode: 'light' | 'dark';
  onClose: () => void;
  onLogout: () => void;
  onToggleColorMode: () => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
};

export function AppShellNavMobile({
  open,
  onOpenChange,
  items,
  isAuthed,
  colorMode,
  onClose,
  onLogout,
  onToggleColorMode,
  onLanguageChange,
}: Props) {
  const { t, i18n } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(85vw,20rem)] max-w-[calc(100vw-2rem)]">
        <SheetHeader>
          <SheetTitle className="text-left">{t('appName')}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 pt-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.to}
                variant="ghost"
                className="justify-start rounded-lg py-6 gap-3 transition-all duration-200 hover:bg-accent/60 hover:translate-x-0.5 hover:font-semibold active:translate-x-0"
                asChild
              >
                <RouterLink to={item.to} onClick={onClose} className="transition-colors duration-200">
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                  {t(item.labelKey)}
                </RouterLink>
              </Button>
            );
          })}
          {!isAuthed && (
            <>
              <Button
                variant="ghost"
                className="justify-start rounded-lg py-6 gap-3 transition-all duration-200 dark:text-amber-400 dark:font-semibold dark:hover:text-amber-300 hover:font-semibold"
                asChild
              >
                <RouterLink to="/login" onClick={onClose} className="transition-colors duration-200">
                  <LogIn className="h-5 w-5 shrink-0" strokeWidth={2} />
                  {t('nav.login')}
                </RouterLink>
              </Button>
              <Button
                className="mt-2 rounded-xl gap-3 bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300 dark:shadow-[0_0_20px_rgba(251,191,36,0.25)] transition-all duration-200"
                asChild
              >
                <RouterLink to="/register" onClick={onClose} className="transition-colors duration-200">
                  <UserPlus className="h-5 w-5 shrink-0" strokeWidth={2} />
                  {t('nav.register')}
                </RouterLink>
              </Button>
            </>
          )}
          {isAuthed && (
            <Button
              variant="ghost"
              className="justify-start rounded-lg py-6 text-foreground transition-all duration-200 hover:bg-accent/60 hover:translate-x-0.5 hover:font-semibold hover:text-destructive active:translate-x-0"
              onClick={() => {
                onClose();
                onLogout();
              }}
            >
              {t('common.logout')}
            </Button>
          )}
          <div className="my-4 border-t border-border" />
          <Button
            variant="ghost"
            className="justify-start rounded-lg py-6 gap-3 transition-all duration-200 hover:bg-accent/60 hover:translate-x-0.5 hover:font-semibold active:translate-x-0"
            onClick={() => {
              onToggleColorMode();
              onClose();
            }}
          >
            {colorMode === 'dark' ? (
              <Sun className="h-5 w-5 shrink-0" strokeWidth={2} />
            ) : (
              <Moon className="h-5 w-5 shrink-0" strokeWidth={2} />
            )}
            {colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
          </Button>
          <div className="flex flex-col pl-2 text-sm text-muted-foreground">
            <span className="py-2 font-medium text-foreground">{t('nav.language')}</span>
            {(['en', 'ru', 'ro'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className="py-1.5 text-left rounded-md transition-all duration-200 hover:bg-accent/50 hover:translate-x-0.5 hover:text-foreground hover:font-medium px-2 -mx-2"
                onClick={() => {
                  onLanguageChange(lang);
                  onClose();
                }}
              >
                {i18n.language === lang ? '✓ ' : ''}
                {lang === 'en' ? 'English' : lang === 'ru' ? 'Русский' : 'Română'}
              </button>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
