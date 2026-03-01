import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TariffMasterLike = {
  tariffType?: unknown;
  tariff?: unknown;
  plan?: unknown;
  lifetimePremium?: boolean | null;
} & Record<string, unknown>;

interface TariffCellProps {
  master: TariffMasterLike | null;
}

export default function TariffCell({ master }: TariffCellProps) {
  const tariff = master?.tariffType ?? master?.tariff ?? master?.plan ?? 'BASIC';
  const tariffUpper = String(tariff).toUpperCase();
  const isLifetimePremium = master?.lifetimePremium === true;

  const variant =
    tariffUpper === 'VIP' ? 'destructive' : tariffUpper === 'PREMIUM' ? 'secondary' : 'outline';

  return (
    <div className="flex items-center gap-1">
      <Badge variant={variant} className="font-semibold text-xs h-8 px-2">
        {tariffUpper}
      </Badge>
      {isLifetimePremium && (
        <Sparkles className="size-4 text-purple-500 animate-pulse" aria-hidden />
      )}
    </div>
  );
}
