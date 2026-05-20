import { Badge } from '@/components/ui/badge';

type PaymentLike = {
  tariffType?: unknown;
  plan?: unknown;
  type?: unknown;
} & Record<string, unknown>;

interface TariffCellProps {
  payment: PaymentLike | null;
}

export default function TariffCell({ payment }: TariffCellProps) {
  const tariff = payment?.tariffType || payment?.plan || payment?.type || 'BASIC';
  const tariffUpper = String(tariff).toUpperCase();

  const variant =
    tariffUpper === 'PLUS' ? 'destructive' : tariffUpper === 'PRO' ? 'secondary' : 'outline';

  return (
    <Badge variant={variant} className="font-semibold text-xs h-8 px-2">
      {tariffUpper}
    </Badge>
  );
}
