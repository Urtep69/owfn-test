
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { OWFN_LOGO_URL } from '../lib/constants.js';

interface SEOProps {
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
  imageUrl?: string;
  replacements?: Record<string, string | number>;
}

const BASE_URL = 'https://www.owfn.org';

export const SEO: React.FC<SEOProps> = ({ title: directTitle, description: directDescription, titleKey, descriptionKey, imageUrl, replacements }) => {
  const { t } = useAppContext();
  const [location] = useLocation();
  
  const title = directTitle || (titleKey ? t(titleKey, replacements) : 'Official World Family Network (OWFN)');
  const description = directDescription || (descriptionKey ? t(descriptionKey, replacements) : 'A global network united by the vision to build a better world through technology and humanity.');
  
  const canonicalUrl = `${BASE_URL}${location === '/' ? '' : location}`;
  // Ensure the final image URL is absolute for crawlers
  const finalImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`) : `${BASE_URL}${OWFN_LOGO_URL}`;

  useEffect(() => {
    document.title = title;

    const updateOrCreateMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement | null;
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    const updateOrCreateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
      if (element) {
        element.href = href;
      } else {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('href', href);
        document.head.appendChild(element);
      }
    };

    updateOrCreateMeta('name', 'description', description);
    updateOrCreateMeta('property', 'og:title', title);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('property', 'og:url', canonicalUrl);
    updateOrCreateMeta('property', 'og:image', finalImageUrl);
    updateOrCreateMeta('property', 'og:type', 'website');
    updateOrCreateMeta('name', 'twitter:title', title);
    updateOrCreateMeta('name', 'twitter:description', description);
    updateOrCreateMeta('name', 'twitter:image', finalImageUrl);
    updateOrCreateMeta('name', 'twitter:url', canonicalUrl);
    updateOrCreateLink('canonical', canonicalUrl);

  }, [title, description, finalImageUrl, canonicalUrl]);

  return null;
};
