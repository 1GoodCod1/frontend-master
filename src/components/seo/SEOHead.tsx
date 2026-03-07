import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    canonical?: string;
    noindex?: boolean;
}

const BASE_TITLE = 'MoldMasters';
const SITE_URL = 'https://moldmasters.md';
const DEFAULT_DESCRIPTION =
    'MoldMasters — платформа для поиска лучших мастеров Молдовы. Маникюр, стрижки, ремонт, уборка и многое другое.';
const DEFAULT_OG_IMAGE = '/og-image.png';

export function SEOHead({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    canonical,
    noindex = false,
}: SEOHeadProps) {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={absoluteOgImage} />
            <meta property="og:site_name" content={BASE_TITLE} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteOgImage} />

            {canonical && <link rel="canonical" href={canonical} />}
        </Helmet>
    );
}
