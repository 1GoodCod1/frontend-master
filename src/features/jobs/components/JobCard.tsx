import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Users, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDateTimeString } from '@/utils/date';
import type { JobDto } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  OPEN: { label: 'Open', icon: Loader2, className: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
  FOUND: { label: 'Found', icon: CheckCircle2, className: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
  CLOSED: { label: 'Closed', icon: XCircle, className: 'text-slate-500 bg-slate-100 dark:bg-slate-500/10' },
  PENDING_CLOSE: { label: 'Closing', icon: Loader2, className: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
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
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateTimeString(job.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
            {job.title}
          </h3>

          {/* Description */}
          <p className="mb-4 flex-1 line-clamp-2 text-xs text-muted-foreground">{job.description}</p>

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
