import { useTranslation } from 'react-i18next';
import { Clock, DollarSign, MapPin, Briefcase } from 'lucide-react';

interface ProposalJobDetailsProps {
  job: {
    title: string;
    type: string;
    budget?: number | null;
    hourlyRate?: number | null;
    city?: { name: string } | null;
    category?: { name: string } | null;
  };
}

export function ProposalJobDetails({ job }: ProposalJobDetailsProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t('jobs.jobDetails', 'Job details')}
      </p>
      <p className="mb-3 text-base font-bold text-foreground">
        {job.title}
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 text-muted-foreground shadow-sm">
          <Clock className="h-3.5 w-3.5" />
          {job.type === 'FIXED_PRICE' ? t('jobs.fixedPrice', 'Fixed Price') : t('jobs.hourly', 'Hourly')}
        </span>
        {job.budget != null && (
          <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 font-semibold text-foreground shadow-sm">
            <DollarSign className="h-3.5 w-3.5 text-primary" />{job.budget} MDL
          </span>
        )}
        {job.hourlyRate != null && (
          <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 font-semibold text-foreground shadow-sm">
            <DollarSign className="h-3.5 w-3.5 text-primary" />{job.hourlyRate} MDL/h
          </span>
        )}
        {job.category && (
          <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 text-primary font-semibold shadow-sm">
            <Briefcase className="h-3.5 w-3.5" />{job.category.name}
          </span>
        )}
        {job.city && (
          <span className="flex items-center gap-1 rounded-full bg-white dark:bg-zinc-800 px-3 py-1.5 text-muted-foreground shadow-sm">
            <MapPin className="h-3.5 w-3.5" />{job.city.name}
          </span>
        )}
      </div>
    </div>
  );
}
