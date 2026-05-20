import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ChevronDown, CircleHelp, LogOut, Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRefreshToken } from '@/features/auth/selectors';
import { useAuthLogoutMutation } from '@/features/auth/authApi';
import { useUsersSetPreferredLanguageMutation } from '@/features/users/usersApi';
import { toggleColorMode } from '@/features/ui/uiSlice';
import { setLanguage } from '@/i18n';
import type { SupportedLanguage } from '@/components/layout/AppShell/types';
import type { TariffPlan } from '@/features/auth/plan';
import { paths } from '@/constants/routes';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { LazyImage } from '@/components/ui/LazyImage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { USER_ROLE } from '@/constants/roles';

type CabinetProfileMenuProps = {
  collapsed: boolean;
  displayName: string;
  avatarUrl?: string;
  role: string | null;
  plan?: TariffPlan | null;
  isOnline?: boolean;
  onMobileClose?: () => void;
};

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'ro', label: 'Română' },
];

const menuItemCls = cn(
  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium outline-none transition-colors',
  'text-[#4A443C] hover:bg-white/80 focus:bg-white/80 focus:text-[#4A443C]',
  'dark:text-white/85 dark:hover:bg-white/[0.06] dark:focus:bg-white/[0.06]',
);

const menuItemActiveCls = cn(
  menuItemCls,
  'bg-white text-[#E97525] hover:bg-white focus:bg-white focus:text-[#E97525]',
  'dark:bg-white/[0.1] dark:text-[#E97525] dark:hover:bg-white/[0.1] dark:focus:bg-white/[0.1]',
);

const sectionLabelCls =
  'px-2.5 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A39E96] dark:text-white/35';

export function CabinetProfileMenu({
  collapsed,
  displayName,
  avatarUrl,
  role,
  plan,
  isOnline = false,
  onMobileClose,
}: CabinetProfileMenuProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthed = useAppSelector(selectIsAuthed);
  const refreshToken = useAppSelector(selectRefreshToken);
  const colorMode = useAppSelector((s) => s.ui.colorMode);
  const [logout] = useAuthLogoutMutation();
  const [setPreferredLanguage] = useUsersSetPreferredLanguageMutation();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (isAuthed) {
      setPreferredLanguage({ lang }).catch(() => undefined);
    }
  };

  const handleLogout = async () => {
    onMobileClose?.();
    setLogoutOpen(false);
    navigate('/', { replace: true });
    try {
      await logout({ refreshToken: refreshToken ?? '' }).unwrap();
    } catch {
      // ignore
    }
  };

  const planLabel =
    role === USER_ROLE.MASTER && plan
      ? `${plan.charAt(0)}${plan.slice(1).toLowerCase()}`
      : null;

  const placeholderVariant =
    plan === 'PREMIUM' ? 'premium' : plan === 'VIP' ? 'vip' : 'default';

  const placeholderRole = role === USER_ROLE.CLIENT ? 'client' : 'master';

  return (
    <>
      <div
        className={cn(
          'shrink-0 space-y-2 border-t p-3',
          colorMode === 'dark'
            ? 'border-white/10 bg-[hsl(var(--cabinet-sidebar-bg))]'
            : 'border-[#E8E4DE] bg-[#FAF9F6]',
        )}
      >
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E97525]/20',
                colorMode === 'dark'
                  ? 'hover:bg-white/[0.06] focus-visible:ring-[#E97525]/30'
                  : 'hover:bg-[#F0EDE8]',
                collapsed && 'justify-center p-2',
              )}
              aria-label={displayName || t('nav.settings')}
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-xl">
                {avatarUrl ? (
                  <LazyImage
                    src={avatarUrl}
                    alt={displayName || ''}
                    objectFit="cover"
                    skeletonHeight={40}
                    skeletonWidth={40}
                    className="size-full"
                  />
                ) : (
                  <AvatarPlaceholder
                    role={placeholderRole}
                    height={40}
                    fillParent
                    variant={placeholderVariant}
                  />
                )}
                {role === USER_ROLE.MASTER && (
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#FAF9F6] dark:border-[hsl(var(--cabinet-sidebar-bg))]',
                      isOnline ? 'bg-emerald-400' : 'bg-slate-400',
                    )}
                  />
                )}
              </div>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-[13px] font-semibold',
                        colorMode === 'dark' ? 'text-slate-100' : 'text-[#334155]',
                      )}
                      title={displayName || undefined}
                    >
                      {displayName || '—'}
                    </p>
                    {planLabel ? (
                      <p
                        className={cn(
                          'mt-0.5 truncate text-[11px]',
                          colorMode === 'dark' ? 'text-slate-400' : 'text-[#94a3b8]',
                        )}
                      >
                        {t('dashboard.subscription')} ·{' '}
                        <span className="font-medium text-[#E97525]">{planLabel}</span>
                      </p>
                    ) : role === USER_ROLE.MASTER ? (
                      <p
                        className={cn(
                          'mt-0.5 truncate text-[11px]',
                          colorMode === 'dark' ? 'text-slate-400' : 'text-[#94a3b8]',
                        )}
                      >
                        {isOnline ? t('master.status.online') : t('master.status.offline')}
                      </p>
                    ) : null}
                  </div>
                  <ChevronDown
                    className={cn(
                      'size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180',
                      colorMode === 'dark' ? 'text-slate-400' : 'text-[#B8B2A8]',
                    )}
                    aria-hidden
                  />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align={collapsed ? 'center' : 'start'}
            sideOffset={8}
            collisionPadding={12}
            className={cn(
              'rounded-xl border border-[#E8E2D8] bg-[#F5F1EB] p-1',
              'shadow-[0_8px_24px_rgba(45,35,20,0.08)]',
              'dark:border-[hsl(var(--border))] dark:bg-[hsl(var(--popover))] dark:text-[hsl(var(--popover-foreground))] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]',
              collapsed ? 'w-52' : 'w-[var(--radix-dropdown-menu-trigger-width)]',
            )}
          >
            <p className={sectionLabelCls}>{t('footer.account')}</p>

            <DropdownMenuItem
              className={menuItemCls}
              onClick={() => dispatch(toggleColorMode())}
            >
              {colorMode === 'dark' ? (
                <Sun className="size-3.5 shrink-0 opacity-60" />
              ) : (
                <Moon className="size-3.5 shrink-0 opacity-60" />
              )}
              {colorMode === 'dark' ? t('theme.light') : t('theme.dark')}
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
              <RouterLink
                to={paths.faq}
                className={menuItemCls}
                onClick={() => onMobileClose?.()}
              >
                <CircleHelp className="size-3.5 shrink-0 opacity-60" />
                {t('footer.faq')}
              </RouterLink>
            </DropdownMenuItem>

            <div className="my-1 h-px bg-[#E0DAD0] dark:bg-white/10" />

            <p className={sectionLabelCls}>{t('nav.language')}</p>

            {LANGUAGES.map(({ code, label }) => (
              <DropdownMenuItem
                key={code}
                className={cn(
                  'p-0 focus:bg-transparent',
                  i18n.language === code ? menuItemActiveCls : menuItemCls,
                )}
                onClick={() => handleLanguageChange(code)}
              >
                <span className="flex w-full items-center px-2.5 py-2">{label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors',
            colorMode === 'dark'
              ? 'border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]'
              : 'border-[#E8E4DE] bg-white/80 text-[#475569] hover:bg-white',
            collapsed && 'px-2',
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && t('common.logout')}
        </button>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.logoutConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('common.logoutConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('common.logout')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
