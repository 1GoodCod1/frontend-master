import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Users, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDateTimeString } from '@/utils/date';
import type { JobDto } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string; iconClassName?: string }> = {
  OPEN: { label: 'Open', icon: Loader2, className: 'text-emerald-600 bg-emerald-50 border border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
  FOUND: { label: 'Found', icon: CheckCircle2, className: 'text-blue-600 bg-blue-50 border border-blue-200/60 dark:bg-blue-500/10 dark:border-blue-500/20' },
  CLOSED: { label: 'Closed', icon: Lock, className: 'text-slate-700 bg-slate-200/70 border border-slate-300 dark:bg-slate-500/20 dark:text-slate-200 dark:border-slate-500/30' },
  PENDING_CLOSE: { label: 'Closing', icon: Loader2, className: 'text-amber-600 bg-amber-50 border border-amber-200/60 dark:bg-amber-500/10 dark:border-amber-500/20', iconClassName: 'animate-spin' },
};

type JobCardProps = {
  job: JobDto;
  linkTo: string;
  showApplicationCount?: boolean;
};

export default function JobCard({ job, linkTo, showApplicationCount }: JobCardProps) {
  const statusConfig = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.OPEN;
  const StatusIcon = statusConfig.icon;

  return (
    <Link to={linkTo} className="flex h-full">
      <Card className="group flex h-full w-full flex-col cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
        <CardContent className="flex flex-1 flex-col p-5">
          {/* Status badge */}
          <div className="mb-3 flex items-center justify-between">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                statusConfig.className,
              )}
            >
              <StatusIcon className={cn('h-3 w-3', statusConfig.iconClassName)} />
              {statusConfig.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateTimeString(job.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 break-words text-sm font-semibold text-foreground group-hover:text-primary">
            {job.title}
          </h3>

          {/* Description */}
          <p className="mb-4 flex-1 line-clamp-2 break-words text-xs text-muted-foreground">{job.description}</p>

          {/* Job type + budget */}
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {job.type === 'FIXED_PRICE' ? 'Fixed price' : 'Hourly'}
            </span>
            {job.type === 'FIXED_PRICE' && job.budget != null && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                {job.budget} MDL
              </span>
            )}
            {job.type === 'HOURLY' && job.hourlyRate != null && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                {job.hourlyRate} MDL/h
              </span>
            )}
          </div>

          {/* Applications count */}
          {showApplicationCount && (
            <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>
                {job._count.applications}{' '}
                {job._count.applications === 1 ? 'application' : 'applications'}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                Min: {job.minJoints} joints
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
