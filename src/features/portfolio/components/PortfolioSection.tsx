import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { usePortfolioByMasterQuery, usePortfolioTagsQuery } from '@/features/portfolio/portfolioApi';
import { mediaUrl } from '@/utils/media';
import { masterDetailCardCls, masterDetailIconWrapCls, masterDetailInsetCls } from '@/features/masters/components/masterDetailsUi';
import { cn } from '@/lib/utils';
import './portfolio.css';

interface PortfolioSectionProps {
    masterId: string;
}

export const PortfolioSection = ({ masterId }: PortfolioSectionProps) => {
    const { t } = useTranslation();
    const [activeTag, setActiveTag] = useState<string | undefined>(undefined);

    const portfolioQuery = usePortfolioByMasterQuery(
        { masterId, serviceTag: activeTag },
        { skip: !masterId },
    );

    const tagsQuery = usePortfolioTagsQuery(
        { masterId },
        { skip: !masterId },
    );

    type PortfolioItem = { id?: string; title?: string; description?: string; beforeFile?: { path?: string }; afterFile?: { path?: string }; serviceTags?: string[] };
    const rawPortfolio = portfolioQuery.data as unknown;
    const items: PortfolioItem[] = (rawPortfolio && typeof rawPortfolio === 'object' && 'data' in rawPortfolio && Array.isArray((rawPortfolio as { data: PortfolioItem[] }).data))
        ? (rawPortfolio as { data: PortfolioItem[] }).data
        : Array.isArray(rawPortfolio)
            ? (rawPortfolio as PortfolioItem[])
            : [];
    const rawTags = tagsQuery.data as unknown;
    const tags: string[] = (rawTags && typeof rawTags === 'object' && 'data' in rawTags && Array.isArray((rawTags as { data: string[] }).data))
        ? (rawTags as { data: string[] }).data
        : Array.isArray(rawTags)
            ? (rawTags as string[])
            : [];

    if (portfolioQuery.isLoading) {
        return (
            <Card className={cn(masterDetailCardCls, 'animate-pulse')}>
                <CardHeader>
                    <div className="h-6 bg-amber-100 dark:bg-amber-900/20 rounded w-40" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className={cn('h-64 bg-amber-50 dark:bg-white/5', masterDetailInsetCls)} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!items.length) return null;

    return (
        <Card className={masterDetailCardCls}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className={masterDetailIconWrapCls}>
                        <Layers className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>{t('masterDetails.portfolio', 'Портфолио')}</CardTitle>
                        <CardDescription>
                            {t('masterDetails.portfolioSubtitle', {
                                count: items.length,
                                defaultValue: '{{count}} работ до/после',
                            })}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Service tag filters */}
                {tags.length > 0 && (
                    <div className="portfolio-filter">
                        <button
                            className={`portfolio-filter__btn ${!activeTag ? 'portfolio-filter__btn--active' : ''}`}
                            onClick={() => setActiveTag(undefined)}
                        >
                            {t('masterDetails.portfolioAllTags', 'Все')}
                        </button>
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                className={`portfolio-filter__btn ${activeTag === tag ? 'portfolio-filter__btn--active' : ''}`}
                                onClick={() => setActiveTag(activeTag === tag ? undefined : tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Portfolio grid */}
                <div className="portfolio-grid">
                    {items.map((item, i) => (
                        <div key={item.id ?? i} className="portfolio-card">
                            <BeforeAfterSlider
                                beforeSrc={mediaUrl(item.beforeFile?.path)}
                                afterSrc={mediaUrl(item.afterFile?.path)}
                                beforeAlt={item.title ? `${item.title} - до` : 'До'}
                                afterAlt={item.title ? `${item.title} - после` : 'После'}
                                height={280}
                            />
                            {(item.title || item.description || (item.serviceTags?.length ?? 0) > 0) && (
                                <div className="portfolio-card__content">
                                    {item.title && (
                                        <h4 className="portfolio-card__title">{String(item.title)}</h4>
                                    )}
                                    {item.description && (
                                        <p className="portfolio-card__description">{String(item.description)}</p>
                                    )}
                                    {(item.serviceTags?.length ?? 0) > 0 && (
                                        <div className="portfolio-card__tags">
                                            {(item.serviceTags ?? []).map((tag) => (
                                                <span key={tag} className="portfolio-tag">
                                                    <Tag className="h-3 w-3" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
