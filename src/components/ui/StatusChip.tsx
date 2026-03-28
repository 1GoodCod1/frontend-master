import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StatusChipKind } from '@/types/ui';
import { USER_ROLE } from '@/constants/roles';

type StatusChipSize = 'small' | 'medium';

function mapVariantAndClass(kind: StatusChipKind, value: string): { variant?: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string } {
  const v = String(value || '').toUpperCase();

  if (kind === 'role') {
    if (v === USER_ROLE.ADMIN) return { variant: 'secondary' };
    if (v === USER_ROLE.MASTER) return { variant: 'default' };
    return { variant: 'outline' };
  }

  if (kind === 'lead') {
    if (v === 'NEW') return { className: 'border-0 bg-blue-500 text-white hover:bg-blue-600' };
    if (v === 'IN_PROGRESS') return { className: 'border-0 bg-amber-500 text-white hover:bg-amber-600' };
    if (v === 'CLOSED') return { className: 'border-0 bg-emerald-600 text-white hover:bg-emerald-700' };
    if (v === 'SPAM') return { variant: 'destructive' };
  }

  if (kind === 'review') {
    if (v === 'PENDING') return { className: 'border-0 bg-amber-500 text-white hover:bg-amber-600' };
    if (v === 'VISIBLE') return { className: 'border-0 bg-emerald-600 text-white hover:bg-emerald-700' };
    if (v === 'HIDDEN') return { variant: 'secondary' };
    if (v === 'REPORTED') return { variant: 'destructive' };
  }

  if (kind === 'payment') {
    if (v === 'PENDING') return { className: 'border-0 bg-amber-500 text-white hover:bg-amber-600' };
    if (v === 'SUCCESS' || v === 'PAID' || v === 'COMPLETED') {
      return { className: 'border-0 bg-emerald-600 text-white hover:bg-emerald-700' };
    }
    if (v === 'FAILED') return { variant: 'destructive' };
    if (v === 'REFUNDED' || v === 'CANCELLED') return { variant: 'secondary' };
  }

  return { variant: 'secondary' };
}

export interface StatusChipProps {
  kind?: StatusChipKind;
  value?: string | null;
  size?: StatusChipSize;
  className?: string;
}

export function StatusChip({ kind = 'generic', value, size = 'small', className }: StatusChipProps) {
  const label = value ? String(value) : '—';
  const { variant, className: mappedClass } = mapVariantAndClass(kind, label);
  return (
    <Badge
      variant={variant}
      className={cn(
        'font-semibold',
        size === 'small' && 'text-[10px] px-1.5 py-0',
        size === 'medium' && 'text-xs px-2 py-0.5',
        mappedClass,
        className
      )}
    >
      {label}
    </Badge>
  );
}
