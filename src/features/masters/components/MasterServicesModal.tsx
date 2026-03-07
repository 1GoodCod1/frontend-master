import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ListChecks, Banknote, HandCoins } from 'lucide-react';
import type { TFunction } from 'i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type PriceType = 'FIXED' | 'NEGOTIABLE';
type Currency = 'MDL' | 'EUR' | 'USD';

export type MasterServiceItem = {
  title: string;
  priceType: PriceType;
  price?: number | null;
  currency?: Currency | null;
};

interface MasterServicesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: MasterServiceItem[];
}

function formatPrice(item: MasterServiceItem, t: TFunction) {
  if (item.priceType !== 'FIXED') return t('masterDetails.negotiable', { defaultValue: 'Negotiable' });
  const price = typeof item.price === 'number' && Number.isFinite(item.price) ? item.price : null;
  const currency = item.currency ?? 'MDL';
  if (price === null) return `${t('masterDetails.fixedPrice', { defaultValue: 'Fixed price' })} · ${currency}`;
  return `${price.toLocaleString()} ${currency}`;
}

export function MasterServicesModal({ open, onOpenChange, services }: MasterServicesModalProps) {
  const { t } = useTranslation();

  const items = useMemo(() => {
    return (Array.isArray(services) ? services : [])
      .filter((s) => s && typeof s.title === 'string' && s.title.trim().length > 0)
      .map((s) => ({
        title: s.title.trim(),
        priceType: s.priceType === 'FIXED' ? ('FIXED' as const) : ('NEGOTIABLE' as const),
        price: typeof s.price === 'number' ? s.price : null,
        currency: s.currency === 'EUR' || s.currency === 'USD' || s.currency === 'MDL' ? s.currency : 'MDL',
      }));
  }, [services]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[26rem] rounded-2xl border-border bg-card shadow-xl dark:shadow-2xl dark:shadow-black/40 p-0 gap-0 overflow-hidden">
        <div className="bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/15 border-b border-border pl-6 pr-12 pt-6 pb-4">
          <DialogHeader className="pr-0">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400">
                <ListChecks className="h-4.5 w-4.5" />
              </div>
              {t('masterDetails.servicesAndPrices')}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('masterDetails.noServices')}</p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto -mx-1 px-1 space-y-2.5">
              {items.map((s, idx) => {
                const isFixed = s.priceType === 'FIXED';
                return (
                  <div
                    key={`${s.title}-${idx}`}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 dark:bg-muted/40 text-muted-foreground group-hover:bg-amber-500/10 group-hover:text-amber-600 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-400 transition-colors">
                      {isFixed ? <Banknote className="h-4.5 w-4.5" /> : <HandCoins className="h-4.5 w-4.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-tight break-words text-foreground">{s.title}</p>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                      isFixed
                        ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'bg-muted/70 text-muted-foreground dark:bg-muted/40'
                    }`}>
                      {formatPrice(s, t)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
