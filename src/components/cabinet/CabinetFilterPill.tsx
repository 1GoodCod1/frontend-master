import { cn } from '@/lib/utils';
import { cabinetFilterPillCls } from '@/lib/cabinetStyles';

type CabinetFilterPillProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export function CabinetFilterPill({ active, onClick, children, className }: CabinetFilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(cabinetFilterPillCls(active), className)}
    >
      {children}
    </button>
  );
}
