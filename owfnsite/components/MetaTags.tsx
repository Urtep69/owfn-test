import React, { useEffect } from 'react';

interface MetaTagsProps {
    title: string;
    description: string;
    keywords: string;
    url: string;
}

const updateMetaTag = (nameOrProperty: string, content: string) => {
    const isProperty = nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('twitter:');
    const selector = isProperty ? `meta[property='${nameOrProperty}']` : `meta[name='${nameOrProperty}']`;
    
    let element = document.querySelector(selector) as HTMLMetaElement;
    if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
            element.setAttribute('property', nameOrProperty);
        } else {
            element.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

export const MetaTags: React.FC<MetaTagsProps> = ({ title, description, keywords, url }) => {
    
    useEffect(() => {
        // Update document title
        document.title = title;

        // Use the absolute URL to the locally hosted image for reliability
        const imageUrl = 'https://www.owfn.org/assets/owfn-social-preview.png';
        const siteName = 'Official World Family Network (OWFN)';
        const twitterSite = '@OWFN_Official';

        // Standard SEO tags
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);

        // Open Graph tags (for Facebook, Discord, etc.)
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:url', url);
        updateMetaTag('og:image', imageUrl);
        updateMetaTag('og:image:secure_url', imageUrl); // Good practice for HTTPS
        updateMetaTag('og:image:width', '1200');
        updateMetaTag('og:image:height', '630');
        updateMetaTag('og:type', 'website');
        updateMetaTag('og:site_name', siteName);

        // Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', imageUrl);
        updateMetaTag('twitter:url', url);
        updateMetaTag('twitter:site', twitterSite);

    }, [title, description, keywords, url]);

    return null; // This component does not render anything to the DOM
};
