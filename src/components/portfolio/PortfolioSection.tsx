import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { usePortfolioByMasterQuery, usePortfolioTagsQuery } from '@/features/portfolio/portfolioApi';
import { mediaUrl } from '@/utils/media';
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

    const items = (portfolioQuery.data as any)?.data ?? portfolioQuery.data ?? [];
    const tags = (tagsQuery.data as any)?.data ?? tagsQuery.data ?? [];

    if (portfolioQuery.isLoading) {
        return (
            <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] shadow-xl shadow-amber-900/20 dark:shadow-none animate-pulse">
                <CardHeader>
                    <div className="h-6 bg-amber-100 dark:bg-amber-900/20 rounded w-40" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-64 bg-amber-50 dark:bg-white/5 rounded-xl" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!items.length) return null;

    return (
        <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] shadow-xl shadow-amber-900/20 dark:shadow-none">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
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
                        {tags.map((tag: string) => (
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
                    {items.map((item: any) => (
                        <div key={item.id} className="portfolio-card">
                            <BeforeAfterSlider
                                beforeSrc={mediaUrl(item.beforeFile?.path)}
                                afterSrc={mediaUrl(item.afterFile?.path)}
                                beforeAlt={item.title ? `${item.title} - до` : 'До'}
                                afterAlt={item.title ? `${item.title} - после` : 'После'}
                                height={280}
                            />
                            {(item.title || item.description || item.serviceTags?.length > 0) && (
                                <div className="portfolio-card__content">
                                    {item.title && (
                                        <h4 className="portfolio-card__title">{item.title}</h4>
                                    )}
                                    {item.description && (
                                        <p className="portfolio-card__description">{item.description}</p>
                                    )}
                                    {item.serviceTags?.length > 0 && (
                                        <div className="portfolio-card__tags">
                                            {item.serviceTags.map((tag: string) => (
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
