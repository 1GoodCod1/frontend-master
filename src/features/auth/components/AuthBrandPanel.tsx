import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, Star, Users } from 'lucide-react';
import { useMastersLandingStatsQuery } from '@/features/masters/mastersApi';
import { useAppSelector } from '@/app/hooks';

type AuthView = 'login' | 'register' | 'forgot';

interface AuthBrandPanelProps {
  view: AuthView;
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

function formatStat(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}K+` : `${k.toFixed(1).replace(/\.0$/, '')}K+`;
  }
  return `${n.toLocaleString()}+`;
}

export function AuthBrandPanel({ view }: AuthBrandPanelProps) {
  const { t } = useTranslation();
  const { data: landingStats } = useMastersLandingStatsQuery();
  const colorMode = useAppSelector((s) => s.ui.colorMode);

  const stats = useMemo(() => {
    const clients = landingStats?.verifiedMastersCount ?? 2500;
    const masters = landingStats?.completedProjectsCount ?? 800;
    const rating =
      landingStats?.averageRating != null && !Number.isNaN(landingStats.averageRating)
        ? landingStats.averageRating.toFixed(1)
        : '4.9';

    return [
      { label: t('auth.leftPanel.statsClients'), value: formatStat(clients), icon: Users },
      { label: t('auth.leftPanel.statsMasters'), value: formatStat(masters), icon: Star },
      { label: t('auth.leftPanel.statsRating'), value: rating, icon: ShieldCheck },
    ];
  }, [landingStats, t]);

  const trustItems = [
    t('auth.leftPanel.trust1'),
    t('auth.leftPanel.trust2'),
    t('auth.leftPanel.trust3'),
  ];

  return (
    <div className="auth-brand-panel">
      <div>
        <Link to="/" className="auth-brand-panel__logo">
          <img
            src={colorMode === 'dark' ? '/brand/logo-dark.svg' : '/brand/logo-light.svg'}
            alt={t('appName')}
            className="h-10 w-auto transition-transform hover:scale-[1.02]"
          />
        </Link>
        <p className="auth-brand-panel__tagline">{t('auth.leftPanel.tagline')}</p>
      </div>

      <div className="auth-brand-panel__body">
        <h2 className="auth-brand-panel__title">{t(TITLES[view])}</h2>
        <p className="auth-brand-panel__subtitle">{t(SUBS[view])}</p>

        <div className="auth-brand-panel__stats">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="auth-brand-panel__stat">
              <Icon size={15} className="auth-brand-panel__stat-icon" strokeWidth={2} />
              <p className="auth-brand-panel__stat-value">{value}</p>
              <p className="auth-brand-panel__stat-label">{label}</p>
            </div>
          ))}
        </div>

        <ul className="auth-brand-panel__trust">
          {trustItems.map((item) => (
            <li key={item} className="auth-brand-panel__trust-item">
              <span className="auth-brand-panel__trust-check">
                <Check size={11} strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="auth-brand-panel__footer">
        <Link to="/privacy">{t('auth.leftPanel.footer')}</Link>
      </p>
    </div>
  );
}
