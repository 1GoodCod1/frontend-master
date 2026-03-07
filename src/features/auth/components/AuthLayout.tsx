import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthView = 'login' | 'register' | 'forgot';

interface AuthLayoutProps {
  view: AuthView;
  children: React.ReactNode;
  className?: string;
}

const TITLES: Record<AuthView, string> = {
  login: 'auth.leftPanel.loginTitle',
  register: 'auth.leftPanel.registerTitle',
  forgot: 'auth.leftPanel.forgotTitle',
};

const SUBS: Record<AuthView, string> = {
  login: 'auth.leftPanel.loginSub',
  register: 'auth.leftPanel.registerSub',
  forgot: 'auth.leftPanel.forgotSub',
};

function AuthLeftPanel({ view }: { view: AuthView }) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'relative flex min-h-full w-full flex-1 flex-col justify-between overflow-hidden p-8 md:p-10',
        'bg-gradient-to-br from-[#171510] via-[#1e1c17] to-[#141210]'
      )}
    >
      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-52 w-52 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(249,115,22,0.13), transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent)',
        }}
      />

      {/* Logo */}
      <div className="relative z-10 shrink-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[10px]"
            style={{
              background: 'linear-gradient(135deg, #f97316, #c85a00)',
            }}
          >
            <Briefcase size={17} color="#fff" />
          </div>
          <span className="text-[1.15rem] font-extrabold tracking-tight text-white">
            Master<span className="text-[#f97316]">Hub</span>
          </span>
        </Link>
        <p className="mt-2 text-[0.78rem] text-white/60">
          {t('auth.leftPanel.tagline')}
        </p>
      </div>

      {/* Content — title and subtitle only, centered */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <h2 className="mb-2.5 text-[1.65rem] font-extrabold leading-tight tracking-tight text-white">
          {t(TITLES[view])}
        </h2>
        <p className="max-w-[280px] text-[0.85rem] leading-relaxed text-white/60">
          {t(SUBS[view])}
        </p>
      </div>
    </div>
  );
}

export function AuthLayout({ view, children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center p-6 transition-colors',
        'bg-background',
        className
      )}
    >
      <div
        className={cn(
          'w-full max-w-[900px] min-h-[580px] overflow-hidden rounded-3xl',
          'grid grid-cols-1 md:grid-cols-2 md:min-h-[88vh]',
          'shadow-[0_30px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.7)]',
          'border border-[#e5e5e5] dark:border-[#1f1f1f]'
        )}
      >
        {/* Left panel — hidden on mobile, stretches to form height */}
        <aside className="hidden md:flex md:min-h-full auth-left">
          <AuthLeftPanel view={view} />
        </aside>

        {/* Right panel — form (no background, blends with page) */}
        <div
          className={cn(
            'flex max-h-[88vh] flex-col overflow-y-auto',
            'bg-transparent',
            'transition-colors'
          )}
        >
          {children}
        </div>
      </div>

    </div>
  );
}
