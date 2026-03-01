import { useTranslation } from 'react-i18next';
import { Flame, Tag, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePromotionsActiveQuery } from '@/features/promotions/promotionsApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaUrl } from '@/utils/media';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { PromotionDto } from '@/types';

export function PromotionsSection() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const { data, isLoading, isError } = usePromotionsActiveQuery({ limit: 6 });
    const promotions = data ?? [];

    if (isError || (!isLoading && promotions.length === 0)) return null;

    const daysUntil = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    return (
        <div className="mb-6 md:mb-8">
            <div className="mb-4">
                <div className="flex flex-row items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-sm bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                        <Tag className="h-5 w-5 shrink-0" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-normal text-foreground">
                            {t('home.promotions', 'Акции и скидки')}
                        </h3>
                        <p className="text-muted-foreground text-[0.9375rem] mt-0.5">
                            {t('home.promotionsSubtitle', 'Лучшие предложения от мастеров')}
                        </p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {promotions.slice(0, 6).map((promo: PromotionDto, idx: number) => {
                        const master = promo.master;
                        const masterName = master
                            ? `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim()
                            : '';
                        const avatarSrc = master?.photos?.[0]?.file?.path
                            ? mediaUrl(master.photos[0].file.path)
                            : null;
                        const days = daysUntil(promo.validUntil);

                        return (
                            <ScrollReveal key={promo.id} delay={idx * 0.06} duration={0.4}>
                                <Card
                                    className="group relative overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:border-rose-500/50 cursor-pointer"
                                    onClick={() => {
                                        if (master?.slug || master?.id) {
                                            nav(`/masters/${master.slug || master.id}`);
                                        }
                                    }}
                                >
                                    {/* Discount badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <Badge className="bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 shadow-lg text-sm font-bold gap-1 px-2.5 py-1">
                                            <Flame className="size-3.5" />
                                            -{promo.discount}%
                                        </Badge>
                                    </div>

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-orange-500/5 dark:from-rose-500/10 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <CardContent className="relative p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            {avatarSrc ? (
                                                <img
                                                    src={avatarSrc}
                                                    alt={masterName}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-200 dark:border-rose-500/30 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                                    {masterName.charAt(0) || '?'}
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-foreground truncate">
                                                    {promo.title}
                                                </h4>
                                                {masterName && (
                                                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                                                        {masterName}
                                                        {master?.category?.name && (
                                                            <span className="opacity-70"> · {master.category.name}</span>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                            {promo.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="size-3.5 opacity-70" />
                                                {days > 0 ? (
                                                    <span>
                                                        {t('home.promotionDaysLeft', 'Ещё {{days}} дн.', { days })}
                                                    </span>
                                                ) : (
                                                    <span className="text-rose-500 font-medium">
                                                        {t('home.promotionLastDay', 'Последний день!')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 group-hover:gap-2 transition-all">
                                                {t('common.details', 'Подробнее')}
                                                <ArrowRight className="size-3.5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
