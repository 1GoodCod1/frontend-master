import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';

export function AuthMobileLogo() {
  const { t } = useTranslation();
  const colorMode = useAppSelector((s) => s.ui.colorMode);

  return (
    <div className="mb-6 flex items-center justify-center md:hidden">
      <Link to="/" className="inline-flex items-center">
        <img
          src={colorMode === 'dark' ? '/brand/logo-dark.svg' : '/brand/logo-light.svg'}
          alt={t('appName')}
          className="h-8 w-auto transition-transform hover:scale-[1.02]"
        />
      </Link>
    </div>
  );
}
