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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-4 w-4 shrink-0" strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('nav.settings')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="w-52 border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 shadow-[0_8px_20px_-14px_hsl(var(--foreground)/0.35)]"
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
