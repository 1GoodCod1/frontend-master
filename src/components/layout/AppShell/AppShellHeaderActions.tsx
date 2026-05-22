import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function AppShellGuestAuthButtons() {
  const { t } = useTranslation();

  return (
    <div className="header-action-group">
      <RouterLink to="/login" className="header-action-btn header-action-btn--ghost">
        {t('nav.login')}
      </RouterLink>
      <RouterLink to="/register" className="header-action-btn header-action-btn--cta">
        {t('nav.register')}
      </RouterLink>
    </div>
  );
}

interface HeaderIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function HeaderIconButton({ children, className, ...props }: HeaderIconButtonProps) {
  return (
    <button type="button" className={cn('header-icon-btn', className)} {...props}>
      {children}
    </button>
  );
}

export function HeaderUtilityGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('header-utility-group', className)}>{children}</div>;
}
