import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Mail, Send, Clock, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import {
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from '@/config/support';

// Unified card style — matches the rest of the site
const cardCls = cn('rounded-2xl', surfaceCardCls);

interface ContactChannel {
  Icon: typeof Mail;
  title: string;
  description: string;
  value: string;
  href: string;
  /** colored icon accent */
  iconColor: string;
  iconBg: string;
  external: boolean;
}

export default function ContactsPage() {
  const { t } = useTranslation();

  const channels: ContactChannel[] = [
    {
      Icon: Mail,
      title: t('contact.email'),
      description: t('contact.emailDescription'),
      value: SUPPORT_EMAIL,
      href: SUPPORT_MAILTO,
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-500/10 dark:bg-sky-400/10',
      external: false,
    },
    {
      Icon: Send,
      title: t('contact.telegram'),
      description: t('contact.telegramDescription'),
      value: TELEGRAM_HANDLE,
      href: TELEGRAM_URL,
      iconColor: 'text-primary dark:text-[#E97525]',
      iconBg: 'bg-primary/10 dark:bg-[#E97525]/10',
      external: true,
    },
  ];

  return (
    <>
      <SEOHead
        title={t('contact.title')}
        description={t('contact.subtitle')}
        keywords={t('contact.seoKeywords')}
      />
      <div className="faber-page-enter container max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-12">
          <h1
            className={cn(
              'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',
              'text-slate-800 dark:text-slate-100',
            )}
          >
            {t('contact.title')}
          </h1>
          <p
            className={cn(
              'mt-3 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed',
              'text-slate-500 dark:text-slate-400',
            )}
          >
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Channels — 2 cards side by side on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-5">
          {channels.map((channel, index) => {
            const Icon = channel.Icon;
            return (
              <div
                key={channel.title}
                className="faber-page-enter h-full"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <a
                  href={channel.href}
                  target={channel.external ? '_blank' : undefined}
                  rel={channel.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    cardCls,
                    'group block h-full rounded-2xl p-5 sm:p-6',
                    'transition duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-black/10',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex items-center justify-center h-12 w-12 rounded-xl shrink-0',
                        channel.iconBg,
                        'group-hover:scale-110 transition-transform duration-300',
                      )}
                    >
                      <Icon className={cn('h-6 w-6', channel.iconColor)} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          'text-lg font-bold tracking-tight',
                          'text-slate-800 dark:text-slate-100',
                        )}
                      >
                        {channel.title}
                      </h3>
                      <p
                        className={cn(
                          'mt-1 text-sm leading-relaxed',
                          'text-slate-500 dark:text-slate-400',
                        )}
                      >
                        {channel.description}
                      </p>
                      <div
                        className={cn(
                          'mt-3 inline-flex items-center gap-1.5 text-sm font-semibold',
                          'text-slate-700 dark:text-slate-200',
                          'group-hover:text-primary dark:group-hover:text-[#E97525]',
                          'transition-colors',
                        )}
                      >
                        <span className="truncate">{channel.value}</span>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {/* Working hours strip */}
        <div
          className="faber-page-enter"
          style={{ animationDelay: '240ms' }}
        >
          <div className={cn(cardCls, 'rounded-2xl p-5 flex items-center gap-4')}>
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 shrink-0">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-sm font-semibold',
                  'text-slate-800 dark:text-slate-100',
                )}
              >
                {t('contact.workingHours')}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-xs sm:text-sm',
                  'text-slate-500 dark:text-slate-400',
                )}
              >
                {t('contact.responseTime')}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ shortcut */}
        <div
          className="faber-page-enter mt-5"
          style={{ animationDelay: '320ms' }}
        >
          <div
            className={cn(
              cardCls,
              'rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden',
            )}
          >
            {/* soft radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 0%, hsl(var(--primary)/0.08), transparent 70%)',
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-violet-500/10 dark:bg-violet-400/10 mb-3">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3
                className={cn(
                  'text-lg sm:text-xl font-bold tracking-tight mb-2',
                  'text-slate-800 dark:text-slate-100',
                )}
              >
                {t('contact.faqCardTitle', 'Looking for a quick answer?')}
              </h3>
              <p
                className={cn(
                  'mb-4 text-sm leading-relaxed max-w-md mx-auto',
                  'text-slate-500 dark:text-slate-400',
                )}
              >
                {t('contact.faqCardDesc', 'Most questions are already answered in our FAQ.')}
              </p>
              <Button asChild variant="outline" className="rounded-full font-semibold gap-2 border-gray-200 dark:border-white/[0.12] text-slate-700 dark:text-slate-300 hover:bg-gray-200/70 hover:text-slate-900 hover:border-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-slate-100 dark:hover:border-white/20">
                <RouterLink to="/faq">
                  <HelpCircle className="h-4 w-4" />
                  {t('contact.faqCardCta', 'Browse the FAQ')}
                </RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
