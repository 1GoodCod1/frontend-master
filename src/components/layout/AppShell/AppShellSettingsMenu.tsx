import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HeaderIconButton, HeaderUtilityGroup } from './AppShellHeaderActions';
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
    <HeaderUtilityGroup>
      <HeaderIconButton
        onClick={onToggleColorMode}
        aria-label={colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
        title={colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
      >
        {colorMode === 'dark' ? (
          <Sun className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
        ) : (
          <Moon className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
        )}
      </HeaderIconButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <HeaderIconButton aria-label={t('nav.language')} title={t('nav.language')}>
            <Globe className="h-[17px] w-[17px] shrink-0" strokeWidth={2} />
          </HeaderIconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="theme-panel-dropdown dropdown-smooth-open min-w-[140px] rounded-xl border border-border p-1.5 shadow-md dark:shadow-black/40"
        >
          <div className="px-2 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('nav.language')}
          </div>
          {(['en', 'ru', 'ro'] as const).map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={
                i18n.language === lang
                  ? 'cursor-pointer rounded-lg bg-muted font-semibold text-foreground focus:bg-muted focus:text-foreground'
                  : 'cursor-pointer rounded-lg font-medium text-foreground/80 focus:bg-muted/70 focus:text-foreground'
              }
            >
              {lang === 'en' ? 'English' : lang === 'ru' ? 'Русский' : 'Română'}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </HeaderUtilityGroup>
  );
}
