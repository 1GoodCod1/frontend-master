import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ListChecks, Banknote, HandCoins, Flame } from 'lucide-react';
import { MasterServiceItem } from '@/components/masters/MasterServicesModal';

export type PromotionInfo = {
  discount: number;
  serviceTitle: string | null;
};

interface MasterDetailsServicesProps {
  services: MasterServiceItem[];
  promotions: PromotionInfo[];
}

function formatPrice(item: MasterServiceItem) {
  if (item.priceType !== 'FIXED') return null;
  const price = typeof item.price === 'number' && Number.isFinite(item.price) ? item.price : null;
  const currency = item.currency ?? 'MDL';
  if (price === null) return null;
  return { value: price, currency };
}

/** Для услуги выбираем лучшую акцию: сначала своя на эту услугу, иначе единая «на все». Из подходящих берём с макс. скидкой. */
function getPromotionForService(serviceTitle: string, promotions: PromotionInfo[]): PromotionInfo | null {
  const forThis = promotions.filter((p) => p.serviceTitle?.trim() === serviceTitle.trim());
  const forAll = promotions.filter((p) => !p.serviceTitle?.trim());
  const specific = forThis.length > 0 ? forThis.reduce((a, b) => (b.discount > a.discount ? b : a)) : null;
  const allServices = forAll.length > 0 ? forAll.reduce((a, b) => (b.discount > a.discount ? b : a)) : null;
  return specific ?? allServices ?? null;
}

function discountedPrice(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100));
}

export function MasterDetailsServices({ services, promotions }: MasterDetailsServicesProps) {
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

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-amber-200/60 dark:border-white/[0.08] bg-card shadow-lg overflow-hidden">
      <div className="bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/15 border-b border-border px-5 sm:px-6 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400">
            <ListChecks className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {t('masterDetails.servicesAndPrices')}
          </h2>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="space-y-2.5">
          {items.map((s, idx) => {
            const isFixed = s.priceType === 'FIXED';
            const promotion = promotions.length > 0 ? getPromotionForService(s.title, promotions) : null;
            const hasPromo = isFixed && promotion !== null;
            const priceInfo = formatPrice(s);
            const originalPrice = isFixed && priceInfo ? priceInfo.value : null;
            const withDiscount =
              hasPromo && originalPrice !== null && promotion
                ? discountedPrice(originalPrice, promotion.discount)
                : null;
            const currency = priceInfo?.currency ?? s.currency ?? 'MDL';

            return (
              <div
                key={`${s.title}-${idx}`}
                className="group flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-3.5 sm:p-4 transition-colors hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 dark:bg-muted/40 text-muted-foreground group-hover:bg-amber-500/10 group-hover:text-amber-600 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-400 transition-colors">
                  {isFixed ? <Banknote className="h-4.5 w-4.5" /> : <HandCoins className="h-4.5 w-4.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm leading-tight break-words text-foreground">{s.title}</p>
                  {hasPromo && promotion && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      <Flame className="h-3.5 w-3.5" />
                      {!promotion.serviceTitle || promotion.serviceTitle === ''
                        ? t('masterDetails.discountOnAll', 'Discount on all services')
                        : t('masterDetails.discountOnThisService', 'Discount on this service')}
                    </span>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-2 flex-wrap">
                  {isFixed && originalPrice !== null ? (
                    hasPromo && withDiscount !== null && promotion && withDiscount < originalPrice ? (
                      <>
                        <span className="text-muted-foreground line-through text-sm">
                          {originalPrice.toLocaleString()} {currency}
                        </span>
                        <span className="rounded-lg bg-rose-500/15 dark:bg-rose-500/25 text-rose-700 dark:text-rose-300 px-2.5 py-1 text-sm font-bold">
                          {withDiscount.toLocaleString()} {currency}
                        </span>
                        <span className="rounded bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white dark:bg-rose-500">
                          −{promotion.discount}%
                        </span>
                      </>
                    ) : (
                      <span className="rounded-lg bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 px-2.5 py-1 text-xs font-bold">
                        {originalPrice.toLocaleString()} {currency}
                      </span>
                    )
                  ) : (
                    <span className="rounded-lg bg-muted/70 text-muted-foreground dark:bg-muted/40 px-2.5 py-1 text-xs font-bold">
                      {t('masterDetails.negotiable', 'Negotiable')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
