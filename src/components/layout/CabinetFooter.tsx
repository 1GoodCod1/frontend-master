import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paths } from '@/constants/routes';

/** Compact footer for dashboard cabinets — lives in the content column only (not under sidebar). */
export function CabinetFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--cabinet-main-bg))] px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-[#868E96] dark:text-white/40">
          © {year} {t('appName')}. {t('footer.copyright')}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <RouterLink
            to={paths.privacy}
            className="text-[11px] text-[#868E96] transition-colors hover:text-[#E97525] dark:text-white/40 dark:hover:text-[#E97525]"
          >
            {t('footer.privacy')}
          </RouterLink>
          <RouterLink
            to={paths.terms}
            className="text-[11px] text-[#868E96] transition-colors hover:text-[#E97525] dark:text-white/40 dark:hover:text-[#E97525]"
          >
            {t('footer.terms')}
          </RouterLink>
        </div>
      </div>
    </footer>
  );
}
