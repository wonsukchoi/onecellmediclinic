import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CMSService } from '../services/cms.service';
import type { DynamicPage as DynamicPageType } from '../types';
import SEO from '../components/SEO/SEO';
import DefaultTemplate from '../components/PageTemplates/DefaultTemplate';
import LandingTemplate from '../components/PageTemplates/LandingTemplate';
import ArticleTemplate from '../components/PageTemplates/ArticleTemplate';
import GalleryTemplate from '../components/PageTemplates/GalleryTemplate';
import styles from './DynamicPage.module.css';

const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<DynamicPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    loadPage(slug);
  }, [slug]);

  useEffect(() => {
    // Apply custom CSS if page has it
    if (page?.custom_css) {
      const styleElement = document.createElement('style');
      styleElement.id = `page-css-${page.id}`;
      styleElement.textContent = page.custom_css;
      document.head.appendChild(styleElement);

      return () => {
        const existingStyle = document.getElementById(`page-css-${page.id}`);
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [page]);

  useEffect(() => {
    // Apply custom JavaScript if page has it
    if (page?.custom_js) {
      const scriptElement = document.createElement('script');
      scriptElement.id = `page-js-${page.id}`;
      scriptElement.textContent = page.custom_js;
      document.body.appendChild(scriptElement);

      return () => {
        const existingScript = document.getElementById(`page-js-${page.id}`);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [page]);

  const loadPage = async (pageSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await CMSService.getPageBySlug(pageSlug);

      if (!response.success || !response.data) {
        if (response.error?.includes('not found') || response.error?.includes('No rows returned')) {
          setNotFound(true);
        } else {
          setError(response.error || '페이지를 불러오는 중 오류가 발생했습니다.');
        }
        return;
      }

      const pageData = response.data;

      // Check if page is published
      if (pageData.status !== 'published') {
        setNotFound(true);
        return;
      }

      setPage(pageData);

      // Track page view
      await CMSService.incrementPageViews(pageSlug);
    } catch (err) {
      console.error('Error loading page:', err);
      setError('페이지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderTemplate = (page: DynamicPageType) => {
    const templateId = page.template_id;

    switch (templateId) {
      case 'landing':
        return <LandingTemplate page={page} />;
      case 'article':
        return <ArticleTemplate page={page} />;
      case 'gallery':
        return <GalleryTemplate page={page} />;
      case 'default':
      default:
        return <DefaultTemplate page={page} />;
    }
  };

  // Show 404 for non-existent pages
  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>페이지를 불러오는 중...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h1>오류가 발생했습니다</h1>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => slug && loadPage(slug)}
            className={styles.retryButton}
          >
            다시 시도
          </button>
          <a href="/" className={styles.homeLink}>
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  // Render page
  if (!page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <SEO page={page} />
      <article className={styles.dynamicPage}>
        {renderTemplate(page)}
      </article>
    </>
  );
};

export default DynamicPage;