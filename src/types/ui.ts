import type { ReactNode } from 'react';

export interface Crumb {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  className?: string;
}

export interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: ReactNode;
  minPlan?: string;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export interface SectionCardProps {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}

export type StatusChipKind = 'lead' | 'review' | 'payment' | 'role' | 'generic';
export type SortOrderNewestOldest = 'newest' | 'oldest';
