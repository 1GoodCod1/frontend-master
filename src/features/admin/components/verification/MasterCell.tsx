import type { VerificationDetail } from '@/features/verification/verificationApi';
import { formatMasterDisplayName } from './formatMasterDisplayName';

interface MasterCellProps {
  master: VerificationDetail['master'] | null;
}

export default function MasterCell({ master }: MasterCellProps) {
  return (
    <span className="text-sm text-foreground">{formatMasterDisplayName(master?.user)}</span>
  );
}
