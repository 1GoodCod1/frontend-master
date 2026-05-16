import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, Zap, UserPlus, FileText, Bookmark, Star, ArrowRight, Lightbulb, ShieldCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/routes';
import { cn } from '@/lib/utils';

const sidebarCardCls = cn(
  'rounded-2xl p-4 border transition duration-300',
  'bg-[#F9FAFB] dark:bg-[hsl(43,16%,12%)]',
  'border-gray-200/80 dark:border-white/[0.08]',
  'shadow-sm dark:shadow-lg dark:shadow-black/20',
);

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function SidebarLink({ to, icon: Icon, label }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-accent transition-colors"
    >
      <Icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
      <span className="flex-1 truncate">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export function JobsSidebar({
  isAuthed,
  isMaster,
}: {
  isAuthed: boolean;
  isMaster: boolean;
}) {
  const { t } = useTranslation();
  const isClient = isAuthed && !isMaster;

  return (
    <div className="space-y-3">
      {/* GUEST: invite to register */}
      {!isAuthed && (
        <>
          <div className={cn(sidebarCardCls, 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/[0.08] dark:to-orange-500/[0.05] border-amber-200/60 dark:border-amber-400/15')}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t('jobs.sidebar.guestCtaTitle', { defaultValue: 'Publică un job gratuit' })}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              {t('jobs.sidebar.guestCtaDesc', {
                defaultValue: 'Înregistrează-te ca client și primește oferte de la specialiști verificați.',
              })}
            </p>
            <Button asChild size="sm" className="w-full h-9 rounded-full font-semibold gap-1.5">
              <Link to={paths.register}>
                <UserPlus className="h-3.5 w-3.5" />
                {t('jobs.sidebar.register', { defaultValue: 'Înregistrează-te' })}
              </Link>
            </Button>
          </div>

          <div className={sidebarCardCls}>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
              {t('jobs.sidebar.masterPromoTitle', { defaultValue: 'Ești specialist?' })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              {t('jobs.sidebar.masterPromoDesc', {
                defaultValue: 'Aplică la joburi cu joints. 30 zile de plan gratuit la verificare.',
              })}
            </p>
            <Button asChild size="sm" variant="outline" className="w-full h-9 rounded-full font-semibold">
              <Link to={paths.plans}>
                {t('jobs.sidebar.viewPlans', { defaultValue: 'Vezi tarifele' })}
              </Link>
            </Button>
          </div>
        </>
      )}

      {/* CLIENT */}
      {isClient && (
        <div className={sidebarCardCls}>
          <Button asChild className="w-full h-10 rounded-full font-semibold gap-2 mb-3">
            <Link to="/client-dashboard/jobs/create">
              <Plus className="h-4 w-4" />
              {t('jobs.sidebar.postNew', { defaultValue: 'Publică un job nou' })}
            </Link>
          </Button>
          <div className="space-y-0.5">
            <SidebarLink
              to="/client-dashboard/jobs"
              icon={FileText}
              label={t('jobs.sidebar.myJobs', { defaultValue: 'Joburile mele' })}
            />
            <SidebarLink
              to="/client-dashboard/favorites"
              icon={Bookmark}
              label={t('jobs.sidebar.savedSpecialists', { defaultValue: 'Specialiști salvați' })}
            />
          </div>
        </div>
      )}

      {/* MASTER */}
      {isMaster && (
        <div className={sidebarCardCls}>
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200/60 dark:border-white/[0.05]">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                {t('jobs.sidebar.master', { defaultValue: 'Specialist' })}
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight mt-0.5">
                {t('jobs.sidebar.masterDashboard', { defaultValue: 'Panou de control' })}
              </p>
            </div>
          </div>
          <div className="space-y-0.5">
            <SidebarLink
              to="/dashboard/jobs/applications"
              icon={FileText}
              label={t('jobs.sidebar.myApplications', { defaultValue: 'Aplicațiile mele' })}
            />
            <SidebarLink
              to="/dashboard/subscription"
              icon={Star}
              label={t('jobs.sidebar.mySubscription', { defaultValue: 'Abonamentul meu' })}
            />
            <SidebarLink
              to={paths.plans}
              icon={Zap}
              label={t('jobs.sidebar.viewPlans', { defaultValue: 'Vezi tarifele' })}
            />
          </div>
        </div>
      )}

      {/* Tips card — visible to everyone */}
      <div className={sidebarCardCls}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t('jobs.sidebar.tipsTitle', { defaultValue: 'Cum funcționează' })}
          </h3>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <li className="flex gap-1.5">
            <span className="text-primary shrink-0">·</span>
            <span>
              {t('jobs.sidebar.tip1', {
                defaultValue: isMaster
                  ? 'Aplică cu joints — ofertă mai mare = rang mai bun.'
                  : 'Publică un job, primești oferte într-o oră.',
              })}
            </span>
          </li>
          <li className="flex gap-1.5">
            <span className="text-primary shrink-0">·</span>
            <span>
              {t('jobs.sidebar.tip2', {
                defaultValue: isMaster
                  ? 'Retragi o aplicație nevăzută — refund complet.'
                  : 'Compară propunerile și alege specialistul cu un click.',
              })}
            </span>
          </li>
          <li className="flex gap-1.5">
            <span className="text-primary shrink-0">·</span>
            <span>
              {t('jobs.sidebar.tip3', {
                defaultValue: 'Joints lunar din abonament — fără taxe ascunse.',
              })}
            </span>
          </li>
        </ul>
        <Link
          to="/how-it-works"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all"
        >
          <BookOpen className="h-3 w-3" />
          {t('jobs.sidebar.learnMore', { defaultValue: 'Află mai mult' })}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Trust block — guests only */}
      {!isAuthed && (
        <div className={cn(sidebarCardCls, 'flex items-start gap-2.5')}>
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('jobs.sidebar.trust', {
              defaultValue: 'Toți specialiștii sunt verificați. Plătești doar atunci când alegi.',
            })}
          </p>
        </div>
      )}
    </div>
  );
}
