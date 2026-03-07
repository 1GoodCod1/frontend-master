import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NEWSLETTER_SUBSCRIBED_KEY = 'newsletter_subscribed';

export function Footer() {
  const { t } = useTranslation();
  const isAuthed = useAppSelector(selectIsAuthed);
  const [email, setEmail] = useState('');
  const [subscribedFromStorage] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, '1');
    } catch {
      // ignore
    }
    setShowSuccess(true);
    toast.success(t('footer.newsletterSuccess'));
    setEmail('');
  };

  const linkClass =
    'text-sm text-muted-foreground transition-colors hover:text-cta dark:text-muted-foreground dark:hover:text-cta underline-offset-2 hover:underline py-1.5 sm:py-0 min-h-[44px] sm:min-h-0 flex items-center';

  return (
    <footer className="mt-auto w-full border-t border-amber-500/15 dark:border-amber-500/10 bg-[#faf8f0] dark:bg-[#171510]">
      {/* Newsletter — hidden after subscribe on F5 */}
      {!subscribedFromStorage && (
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mx-auto max-w-6xl rounded-2xl border border-amber-500/15 dark:border-amber-500/10 bg-white dark:bg-white/[0.04] px-6 py-6 sm:px-8 sm:py-7 shadow-sm">
            {showSuccess ? (
              <div className="mx-auto flex max-w-[560px] items-center gap-3 text-foreground">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cta/20 text-cta">
                  <Check className="h-5 w-5" />
                </div>
                <p className="font-semibold">{t('footer.newsletterSuccess')}</p>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="mx-auto flex max-w-[640px] flex-col gap-4 sm:gap-5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-bold text-foreground">
                    {t('footer.newsletterTitle')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('footer.newsletterDescription')}
                  </p>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:min-w-[320px] sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t('footer.newsletterPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-xl pl-9 bg-gray-50 dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.08]"
                    />
                  </div>
                  <Button type="submit" className="min-w-[120px] min-h-[44px] rounded-xl font-semibold bg-cta text-cta-foreground hover:bg-cta/90 dark:bg-cta dark:text-cta-foreground dark:hover:bg-cta/90">
                    {t('footer.newsletterButton')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main footer */}
      <div className="px-4 pt-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] md:px-6 md:pt-10 md:pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-8 justify-between gap-y-8">
            <div className="col-span-12 md:col-span-4">
              <div className="mb-2 flex items-center gap-2">
                <img
                  src="/brand/favicon.svg"
                  alt=""
                  className="h-8 w-8"
                  width={32}
                  height={32}
                />
                <h3 className="text-lg font-extrabold tracking-tight">
                  {t('appName')}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('footer.aboutDescription')}
              </p>
            </div>

            <div className="col-span-6 sm:col-span-4 md:col-span-2">
              <h4 className="mb-2 text-sm font-bold tracking-wide">
                {t('footer.quickLinks')}
              </h4>
              <nav className="flex flex-col gap-1 sm:gap-2">
                <RouterLink to="/masters" className={linkClass}>
                  {t('footer.masters')}
                </RouterLink>
                <RouterLink to="/plans" className={linkClass}>
                  {t('footer.plans')}
                </RouterLink>
                <RouterLink to="/how-it-works" className={linkClass}>
                  {t('footer.howItWorks')}
                </RouterLink>
                <RouterLink to="/faq" className={linkClass}>
                  {t('footer.faq')}
                </RouterLink>
                {!isAuthed && (
                  <RouterLink to="/login" className={linkClass}>
                    {t('nav.login')}
                  </RouterLink>
                )}
              </nav>
            </div>

            <div className="col-span-6 sm:col-span-4 md:col-span-2">
              <h4 className="mb-2 text-sm font-bold tracking-wide">
                {t('footer.support')}
              </h4>
              <nav className="flex flex-col gap-1 sm:gap-2">
                <RouterLink to="/contact" className={linkClass}>
                  {t('footer.contact')}
                </RouterLink>
                <RouterLink to="/privacy" className={linkClass}>
                  {t('footer.privacy')}
                </RouterLink>
                <RouterLink to="/terms" className={linkClass}>
                  {t('footer.terms')}
                </RouterLink>
              </nav>
            </div>
          </div>

          <div className="mt-10 border-t border-amber-500/15 dark:border-amber-500/10 pt-6 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {t('appName')}. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
