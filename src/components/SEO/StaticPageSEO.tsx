import React, { useEffect } from 'react';

interface StaticPageSEOProps {
  title: string;
  description: string;
  siteName?: string;
  baseUrl?: string;
  keywords?: string;
}

const StaticPageSEO: React.FC<StaticPageSEOProps> = ({
  title,
  description,
  siteName = 'OneCell Medi Clinic',
  baseUrl = 'https://onecellmediclinic.com',
  keywords = ''
}) => {
  useEffect(() => {
    // Set document title
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

    // Meta description
    if (description) {
      head.appendChild(createMetaTag({ name: 'description', content: description }));
    }

    // Meta keywords
    if (keywords) {
      head.appendChild(createMetaTag({ name: 'keywords', content: keywords }));
    }

    // Canonical URL
    const currentPath = window.location.pathname;
    const canonicalUrl = `${baseUrl}${currentPath}`;
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;
    canonicalLink.setAttribute('data-seo', 'true');
    head.appendChild(canonicalLink);

    // Open Graph tags
    head.appendChild(createMetaTag({ property: 'og:title', content: title }));
    head.appendChild(createMetaTag({ property: 'og:description', content: description }));
    head.appendChild(createMetaTag({ property: 'og:url', content: canonicalUrl }));
    head.appendChild(createMetaTag({ property: 'og:type', content: 'website' }));
    head.appendChild(createMetaTag({ property: 'og:site_name', content: siteName }));

    // Twitter Card tags
    head.appendChild(createMetaTag({ name: 'twitter:card', content: 'summary' }));
    head.appendChild(createMetaTag({ name: 'twitter:title', content: title }));
    head.appendChild(createMetaTag({ name: 'twitter:description', content: description }));

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
  }, [title, description, siteName, baseUrl, keywords]);

  return null; // This component doesn't render anything
};

export default StaticPageSEO;
