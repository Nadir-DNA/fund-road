import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  schema?: object;
}

export const useSEO = ({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = 'https://fundroad.com/og-default.jpg',
  ogType = 'website',
  noIndex = false,
  schema
}: SEOConfig) => {
  const location = useLocation();
  const baseUrl = 'https://fundroad.com';
  const fullUrl = `${baseUrl}${location.pathname}`;
  const canonicalUrl = canonical || fullUrl;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords.join(', '));
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:url', fullUrl);
    updateMetaProperty('og:image', ogImage);
    updateMetaProperty('og:type', ogType);
    updateMetaProperty('og:site_name', 'Fund Road');

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@fundroad');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Update canonical link
    updateCanonical(canonicalUrl);

    // Update JSON-LD structured data
    if (schema) {
      updateStructuredData(schema);
    }

    return () => {
      // Cleanup function to remove dynamically added elements
      const existingJsonLd = document.getElementById('json-ld');
      if (existingJsonLd) {
        existingJsonLd.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex, schema, fullUrl]);
};

const updateMetaTag = (name: string, content: string) => {
  if (!content) return;
  
  let element = document.querySelector(`meta[name="${name}"]`);
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

const updateMetaProperty = (property: string, content: string) => {
  if (!content) return;
  
  let element = document.querySelector(`meta[property="${property}"]`);
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

const updateCanonical = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', url);
  } else {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', url);
    document.head.appendChild(canonical);
  }
};

const updateStructuredData = (schema: object) => {
  // Remove existing structured data
  const existing = document.getElementById('json-ld');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'json-ld';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};