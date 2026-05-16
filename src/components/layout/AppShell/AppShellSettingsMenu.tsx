import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    <div className="flex items-center gap-1">
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleColorMode}
        className="h-9 w-9 rounded-lg text-slate-500 transition-colors duration-200 hover:bg-[#E97525]/10 hover:text-[#E97525] dark:text-white/65 dark:hover:bg-[#E97525]/15"
        aria-label={colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
        title={colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
      >
        {colorMode === 'dark' ? (
          <Sun className="h-4 w-4 shrink-0" strokeWidth={2} />
        ) : (
          <Moon className="h-4 w-4 shrink-0" strokeWidth={2} />
        )}
      </Button>

      {/* Language Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-slate-500 transition-colors duration-200 hover:bg-[#E97525]/10 hover:text-[#E97525] dark:text-white/65 dark:hover:bg-[#E97525]/15"
            aria-label={t('nav.language')}
            title={t('nav.language')}
          >
            <Globe className="h-4 w-4 shrink-0" strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="min-w-[140px] border border-black/5 dark:border-white/5 rounded-2xl p-2 shadow-xl bg-popover/90 backdrop-blur"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {t('nav.language')}
          </div>
          <DropdownMenuItem
            onClick={() => onLanguageChange('en')}
            className={`cursor-pointer rounded-xl font-medium ${i18n.language === 'en' ? 'bg-[#E97525]/10 text-[#E97525]' : ''}`}
          >
            English
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onLanguageChange('ru')}
            className={`cursor-pointer rounded-xl font-medium ${i18n.language === 'ru' ? 'bg-[#E97525]/10 text-[#E97525]' : ''}`}
          >
            Русский
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onLanguageChange('ro')}
            className={`cursor-pointer rounded-xl font-medium ${i18n.language === 'ro' ? 'bg-[#E97525]/10 text-[#E97525]' : ''}`}
          >
            Română
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
