import { cn } from '@/lib/utils';
import { AuthBrandPanel } from '@/features/auth/components/AuthBrandPanel';
import { AuthMobileLogo } from '@/features/auth/components/AuthMobileLogo';

type AuthView = 'login' | 'register' | 'forgot';

interface AuthLayoutProps {
  view: AuthView;
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ view, children, className }: AuthLayoutProps) {
  return (
    <div className={cn('auth-page bg-background', className)}>
      <div className="auth-shell">
        <div className="auth-card">
          <aside className="auth-card__brand hidden md:block">
            <AuthBrandPanel view={view} />
          </aside>

          <div className="auth-card__form">
            <AuthMobileLogo />
            <div className="auth-form-content">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
