import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ListChecks, Banknote, HandCoins, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MasterServiceItem } from '@/features/masters/components/MasterServicesModal';

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
    <Card className="bg-white dark:bg-[hsl(47,22%,9%)] border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-sm transition-colors duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <ListChecks className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-gray-900 dark:text-gray-100 font-semibold">
              {t('masterDetails.servicesAndPrices')}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
              className="group flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3.5 sm:p-4 transition-colors hover:border-amber-500/40 hover:bg-amber-50/30 dark:hover:bg-white/10"
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
      </CardContent>
    </Card>
  );
}
