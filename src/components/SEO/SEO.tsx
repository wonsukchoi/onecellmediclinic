import React, { useEffect } from 'react';
import type { DynamicPage } from '../../types';

interface SEOProps {
  page: DynamicPage;
  defaultTitle?: string;
  defaultDescription?: string;
  siteName?: string;
  baseUrl?: string;
}

const SEO: React.FC<SEOProps> = ({
  page,
  defaultTitle = 'OneCell Medi Clinic',
  defaultDescription = '원셀메디클리닉 - 안전하고 전문적인 성형외과 및 피부과 진료',
  siteName = 'OneCell Medi Clinic',
  baseUrl = 'https://onecellmediclinic.com'
}) => {
  useEffect(() => {
    // Set document title
    const title = page.meta_title || page.title || defaultTitle;
    document.title = title;

    // Clear existing meta tags
    const existingMetaTags = document.querySelectorAll('meta[data-seo]');
    existingMetaTags.forEach(tag => tag.remove());

    // Helper function to create meta tag
    const createMetaTag = (attrs: Record<string, string>) => {
      const meta = document.createElement('meta');
      Object.entries(attrs).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      meta.setAttribute('data-seo', 'true');
      return meta;
    };

    const head = document.head;

    // Basic meta tags
    const description = page.meta_description || page.description || defaultDescription;
    const keywords = page.keywords || '';
    const currentUrl = `${baseUrl}/${page.slug}`;

    // Meta description
    if (description) {
      head.appendChild(createMetaTag({ name: 'description', content: description }));
    }

    // Meta keywords
    if (keywords) {
      head.appendChild(createMetaTag({ name: 'keywords', content: keywords }));
    }

    // Canonical URL
    const canonicalUrl = page.seo_canonical_url || currentUrl;
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;
    canonicalLink.setAttribute('data-seo', 'true');
    head.appendChild(canonicalLink);

    // Open Graph tags
    head.appendChild(createMetaTag({ property: 'og:title', content: title }));
    head.appendChild(createMetaTag({ property: 'og:description', content: description }));
    head.appendChild(createMetaTag({ property: 'og:url', content: currentUrl }));
    head.appendChild(createMetaTag({ property: 'og:type', content: 'website' }));
    head.appendChild(createMetaTag({ property: 'og:site_name', content: siteName }));

    // Open Graph image
    const ogImage = page.seo_og_image || page.featured_image;
    if (ogImage) {
      const imageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
      head.appendChild(createMetaTag({ property: 'og:image', content: imageUrl }));
      head.appendChild(createMetaTag({ property: 'og:image:alt', content: title }));
    }

    // Twitter Card tags
    head.appendChild(createMetaTag({ name: 'twitter:card', content: 'summary_large_image' }));
    head.appendChild(createMetaTag({ name: 'twitter:title', content: title }));
    head.appendChild(createMetaTag({ name: 'twitter:description', content: description }));

    if (ogImage) {
      const imageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
      head.appendChild(createMetaTag({ name: 'twitter:image', content: imageUrl }));
    }

    // Additional meta tags for medical clinic
    head.appendChild(createMetaTag({ name: 'author', content: siteName }));
    head.appendChild(createMetaTag({ name: 'robots', content: 'index, follow' }));
    head.appendChild(createMetaTag({ name: 'viewport', content: 'width=device-width, initial-scale=1.0' }));
    head.appendChild(createMetaTag({ 'http-equiv': 'Content-Type', content: 'text/html; charset=utf-8' }));

    // Structured data for medical organization
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: siteName,
      url: baseUrl,
      description: description,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR'
      },
      specialty: ['Plastic Surgery', 'Dermatology', 'Aesthetic Medicine']
    };

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.setAttribute('data-seo', 'true');
    scriptTag.textContent = JSON.stringify(structuredData);
    head.appendChild(scriptTag);

    // Cleanup function
    return () => {
      const seoElements = document.querySelectorAll('[data-seo]');
      seoElements.forEach(element => element.remove());
    };
  }, [page, defaultTitle, defaultDescription, siteName, baseUrl]);

  return null; // This component doesn't render anything
};

export default SEO;