import type { VerificationDetail } from '@/features/verification/verificationApi';

interface MasterCellProps {
  master: VerificationDetail['master'] | null;
}

export default function MasterCell({ master }: MasterCellProps) {
  const name =
    master?.user?.firstName && master?.user?.lastName
      ? `${master.user.firstName} ${master.user.lastName}`
      : 'N/A';
  return <span className="text-sm text-foreground">{name}</span>;
}
