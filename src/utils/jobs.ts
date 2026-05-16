import type { MilestoneDto } from '@/types';

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
