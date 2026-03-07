import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SupportedLanguage } from './types';

type Props = {
  colorMode: 'light' | 'dark';
  onToggleColorMode: () => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
};

export function AppShellSettingsMenu({
  colorMode,
  onToggleColorMode,
  onLanguageChange,
}: Props) {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 transition-transform duration-200 ease-out hover:scale-110 active:scale-95"
          aria-label={t('nav.settings')}
          title={t('nav.settings')}
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="dropdown-smooth-open dropdown-content-opaque w-52 border-0 rounded-2xl shadow-[0_10px_24px_-14px_hsl(var(--foreground)/0.45)]"
      >
        <DropdownMenuItem onClick={onToggleColorMode}>
          {colorMode === 'dark' ? (
            <Sun className="mr-2 h-4 w-4 shrink-0" strokeWidth={2} />
          ) : (
            <Moon className="mr-2 h-4 w-4 shrink-0" strokeWidth={2} />
          )}
          {colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Globe className="mr-2 h-4 w-4 shrink-0" strokeWidth={2} />
          {t('nav.language')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLanguageChange('en')}>
          {i18n.language === 'en' && '✓ '}English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLanguageChange('ru')}>
          {i18n.language === 'ru' && '✓ '}Русский
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLanguageChange('ro')}>
          {i18n.language === 'ro' && '✓ '}Română
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
