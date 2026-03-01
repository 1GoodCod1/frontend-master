import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { AppShellNavItem } from './types';

type Props = {
  items: AppShellNavItem[];
  navLinkClass: (isActive: boolean) => string;
  centered?: boolean;
};

export function AppShellNavDesktop({ items, navLinkClass, centered }: Props) {
  const { t } = useTranslation();
  return (
    <nav
      className={cn(
        'hidden md:flex items-center gap-1',
        centered && 'absolute left-1/2 -translate-x-1/2'
      )}
    >
      {items.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={false}
          className={({ isActive }) => navLinkClass(isActive)}
        >
          <Icon className="shrink-0" strokeWidth={2} />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}
