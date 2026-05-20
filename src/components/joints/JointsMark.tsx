import { cn } from '@/lib/utils';

type JointsMarkProps = {
  className?: string;
};

/** Faber Joints coin mark — use inside JointsBadge or standalone. */
export function JointsMark({ className }: JointsMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" fill="url(#joints-coin)" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.25" opacity="0.45" />
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
      <path
        d="M14.2 7.5L10.4 12.4H12.8L10.2 16.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <radialGradient id="joints-coin" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
        </radialGradient>
      </defs>
    </svg>
  );
}
