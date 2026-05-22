import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function AuthMobileLogo() {
  const { t } = useTranslation();
  const appName = t('appName');
  const wordmark =
    appName.length >= 3 ? (
      <>
        {appName.slice(0, -2)}
        <span className="text-[#f97316]">{appName.slice(-2)}</span>
      </>
    ) : (
      appName
    );

  return (
    <div className="mb-6 flex items-center justify-center md:hidden">
      <Link to="/" className="inline-flex items-center gap-2">
        <img src="/brand/favicon.svg" alt="" className="h-8 w-8" width={32} height={32} />
        <span className="text-[1.05rem] font-extrabold tracking-tight">{wordmark}</span>
      </Link>
    </div>
  );
}
