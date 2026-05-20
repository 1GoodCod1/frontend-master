import { Link } from 'react-router-dom';
import { useJointsBalanceQuery } from '@/features/joints/jointsApi';
import { JointsBadge } from '@/components/joints/JointsBadge';
import { cn } from '@/lib/utils';

export function JointsBalanceBadge() {
  const { data } = useJointsBalanceQuery(undefined, { pollingInterval: 30_000 });
  const balance = data?.balance ?? 0;

  return (
    <Link
      to="/dashboard/jobs/applications"
      title="Joints"
      className={cn(
        'group rounded-[12px] transition duration-200',
        'hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-900/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E97525]/35',
      )}
    >
      <JointsBadge
        value={balance}
        size="lg"
        showLabel
        className="group-hover:border-[#E97525]/55 dark:group-hover:border-[#E97525]/50"
      />
    </Link>
  );
}
