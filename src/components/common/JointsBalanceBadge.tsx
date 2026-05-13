import { Link } from 'react-router-dom';
import { useJointsBalanceQuery } from '@/features/joints/jointsApi';

/** Stylised "J" with a lightning bolt cutout — the Joints icon */
function JointsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Hexagon background */}
      <path
        d="M10 1.5L17.5 5.75V14.25L10 18.5L2.5 14.25V5.75L10 1.5Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M10 1.5L17.5 5.75V14.25L10 18.5L2.5 14.25V5.75L10 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Lightning-J shape */}
      <path
        d="M11.8 4.5L8.2 10.2H11L8.2 15.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function JointsBalanceBadge() {
  const { data } = useJointsBalanceQuery(undefined, { pollingInterval: 30_000 });
  const balance = data?.balance ?? 0;

  return (
    <Link
      to="/dashboard/jobs/applications"
      className="group flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary transition-all hover:border-primary/60 hover:bg-primary/15 hover:shadow-sm"
    >
      <JointsIcon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
      <span className="tabular-nums">{balance}</span>
    </Link>
  );
}
