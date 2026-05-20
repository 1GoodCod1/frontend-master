import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { CabinetEmptyState } from '@/components/cabinet/CabinetEmptyState';

type ClientEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function ClientEmptyState(props: ClientEmptyStateProps) {
  return <CabinetEmptyState {...props} />;
}
