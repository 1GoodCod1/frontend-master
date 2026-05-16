import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, CheckCircle2, MapPin, Users, Zap, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { JobDto } from '@/types';
import { timeAgo, proposalRange } from '@/utils/jobs';

interface JobListItemProps {
  job: JobDto;
  selected: boolean;
  onClick: () => void;
  saved: boolean;
  onSave: (e: React.MouseEvent) => void;
  applied: boolean;
}

export function JobListItem({ job, selected, onClick, saved, onSave, applied }: JobListItemProps) {
  const { t } = useTranslation();
  return (
    <div className="px-3 py-1.5">
      <Card
        onClick={onClick}
        className={cn(
          'group cursor-pointer transition-all duration-300 hover:-translate-y-0.5',
          'bg-[#F9FAFB] dark:bg-[hsl(43,16%,12%)]',
          'border border-gray-200/80 dark:border-white/[0.08]',
          'shadow-sm hover:shadow-md hover:shadow-black/10 dark:shadow-lg dark:shadow-black/20',
          selected && 'ring-2 ring-primary/30 border-primary/30',
        )}
      >
        <CardContent className="p-4">
          {/* Row 1: title + bookmark */}
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <h3 className={cn(
              'flex-1 min-w-0 text-sm font-semibold leading-snug line-clamp-1 transition-colors',
              selected ? 'text-primary' : 'text-slate-800 dark:text-slate-100 group-hover:text-primary',
            )}>
              {job.title}
            </h3>
            <button
              onClick={onSave}
              className={cn(
                'shrink-0 -mt-0.5 rounded-lg p-1.5 transition-colors',
                saved ? 'text-primary' : 'text-muted-foreground/30 group-hover:text-muted-foreground hover:!text-primary',
              )}
            >
              {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Row 2: type · budget · time */}
          <div className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice') : t('jobs.hourly')}</span>
            {(job.budget != null || job.hourlyRate != null) && (
              <>
                <span>·</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {job.budget != null ? `${job.budget} MDL` : `${job.hourlyRate} MDL/h`}
                </span>
              </>
            )}
            <span>·</span>
            <span>{timeAgo(job.createdAt)}</span>
          </div>

          {/* Row 3: description */}
          <p className="mb-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {job.description}
          </p>

          {/* Row 4: tags */}
          <div className="flex flex-wrap items-center gap-2">
            {job.category && (
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                <Briefcase className="h-3 w-3" />{job.category.name}
              </span>
            )}
            {job.city && (
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3 w-3" />{job.city.name}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Users className="h-3 w-3" />{proposalRange(job._count?.applications || 0, t('jobs.noProposals', 'No proposals'))}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Zap className="h-2.5 w-2.5" />{job.minJoints} joints
            </span>
            {applied && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-2.5 w-2.5" />{t('jobs.applied', 'Applied')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
