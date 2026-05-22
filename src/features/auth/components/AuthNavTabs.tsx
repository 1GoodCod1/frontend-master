import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function AuthNavTabs() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const tabs = [
    { to: '/login', label: t('auth.login.title'), active: pathname === '/login' },
    { to: '/register', label: t('nav.register'), active: pathname === '/register' },
  ];

  return (
    <div className="auth-nav-tabs mb-7">
      {tabs.map(({ to, label, active }) => (
        <Link
          key={to}
          to={to}
          className={cn('auth-nav-tab', active && 'auth-nav-tab--active')}
          aria-current={active ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
