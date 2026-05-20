import type { TFunction } from 'i18next';
import type { MilestoneDto } from '@/types';

const SEED_JOB_TITLE_PREFIX = /^seed-job-/i;

export function displayJobTitle(title: string): string {
  return title.replace(SEED_JOB_TITLE_PREFIX, '').trim();
}

export function formatJobRelativeTime(t: TFunction, dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t('home.activeJobs.timeNow');
  if (minutes < 60) return t('home.activeJobs.timeMinutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('home.activeJobs.timeHours', { count: hours });
  const days = Math.floor(hours / 24);
  return t('home.activeJobs.timeDays', { count: days });
}

export function formatJobPrice(
  job: { budget: number | null; hourlyRate: number | null; type?: string },
  t: TFunction,
): string | null {
  if (job.budget != null) {
    return t('home.activeJobs.priceFixed', {
      amount: job.budget.toLocaleString('ro-MD'),
    });
  }
  if (job.hourlyRate != null) {
    return t('home.activeJobs.priceHourly', {
      amount: job.hourlyRate.toLocaleString('ro-MD'),
    });
  }
  return null;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function proposalRange(n: number, noProposalsLabel: string): string {
  if (n === 0) return noProposalsLabel;
  if (n < 5) return '< 5';
  if (n < 10) return '5–10';
  if (n < 20) return '10–20';
  if (n < 50) return '20–50';
  return '50+';
}

export const emptyMilestone = (): MilestoneDto => ({
  title: '',
  description: '',
  price: 0,
  dueDate: '',
});
