import { DollarSign } from 'lucide-react';

interface AmountCellProps {
  amount: number | string | undefined;
  currency: string | undefined;
}

export default function AmountCell({ amount, currency }: AmountCellProps) {
  const amountValue = amount ?? 0;
  const currencyValue = currency || 'MDL';

  return (
    <div className="flex items-center gap-1">
      <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span className="text-sm font-bold text-foreground">{amountValue}</span>
      <span className="text-xs text-muted-foreground font-semibold">{currencyValue}</span>
    </div>
  );
}
