import { cn } from '@/lib/utils';
import { clientFilterPillCls } from '@/lib/clientCabinetStyles';

type ClientFilterPillProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

export function ClientFilterPill({ active, onClick, children, className }: ClientFilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(clientFilterPillCls(active), className)}
    >
      {children}
    </button>
  );
}
