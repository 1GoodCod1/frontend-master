import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    canonical?: string;
    noindex?: boolean;
}

export const SITE_URL = 'https://faber.md';
const BASE_TITLE = 'Faber';
const DEFAULT_OG_IMAGE = '/og-image.png';

/** Moldova geo-targeting for search engines */
const GEO_META = (
    <>
        <meta name="geo.region" content="MD" />
        <meta name="geo.placename" content="Moldova" />
        <meta name="ICBM" content="47.0, 29.0" />
    </>
);

export function SEOHead({
    title,
    description,
    keywords,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    canonical,
    noindex = false,
}: SEOHeadProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const resolvedDescription = description ?? t('home.seoDefaultDescription');
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;
    const canonicalUrl = canonical ?? `${SITE_URL}${location.pathname}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={resolvedDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Moldova geo-targeting */}
            {GEO_META}

            {/* hreflang — multilingual (en, ru, ro) */}
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
            <link rel="alternate" hrefLang="en" href={canonicalUrl} />
            <link rel="alternate" hrefLang="ru" href={canonicalUrl} />
            <link rel="alternate" hrefLang="ro" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={resolvedDescription} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={absoluteOgImage} />
            <meta property="og:site_name" content={BASE_TITLE} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:locale" content="ro_MD" />
            <meta property="og:locale:alternate" content="en_US" />
            <meta property="og:locale:alternate" content="ru_RU" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={resolvedDescription} />
            <meta name="twitter:image" content={absoluteOgImage} />

            <link rel="canonical" href={canonicalUrl} />
        </Helmet>
    );
}
