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
        className="h-9 w-9 transition-colors duration-200"
        aria-label={colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
        title={colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
      >
        {colorMode === 'dark' ? (
          <Sun className="h-4 w-4 text-amber-500 shrink-0" strokeWidth={2} />
        ) : (
          <Moon className="h-4 w-4 text-slate-700 shrink-0" strokeWidth={2} />
        )}
      </Button>

      {/* Language Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 transition-colors duration-200"
            aria-label={t('nav.language')}
            title={t('nav.language')}
          >
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 shrink-0" strokeWidth={2} />
            </div>
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
            className={`cursor-pointer rounded-xl font-medium ${i18n.language === 'en' ? 'bg-amber-500/10 text-amber-600' : ''}`}
          >
            English
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onLanguageChange('ru')}
            className={`cursor-pointer rounded-xl font-medium ${i18n.language === 'ru' ? 'bg-amber-500/10 text-amber-600' : ''}`}
          >
            Русский
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onLanguageChange('ro')}
            className={`cursor-pointer rounded-xl font-medium ${i18n.language === 'ro' ? 'bg-amber-500/10 text-amber-600' : ''}`}
          >
            Română
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
