import React from 'react';
import type { DynamicPage } from '../../types';
import BlockRenderer from '../BlockRenderer/BlockRenderer';
import styles from './DefaultTemplate.module.css';

interface DefaultTemplateProps {
  page: DynamicPage;
  className?: string;
}

const DefaultTemplate: React.FC<DefaultTemplateProps> = ({ page, className }) => {
  const blocks = page.blocks || [];
  const sortedBlocks = blocks.sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={`${styles.defaultTemplate} ${className || ''}`}>
      <div className={styles.container}>
        {/* Page Header */}
        <header className={styles.pageHeader}>
          {page.featured_image && (
            <div className={styles.featuredImage}>
              <img
                src={page.featured_image}
                alt={page.title}
                loading="eager"
              />
            </div>
          )}
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>{page.title}</h1>
            {page.description && (
              <p className={styles.pageDescription}>{page.description}</p>
            )}
            <div className={styles.pageMeta}>
              {page.published_at && (
                <time dateTime={page.published_at} className={styles.publishDate}>
                  {new Date(page.published_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              )}
              <span className={styles.viewCount}>조회수 {page.view_count}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          {sortedBlocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </main>

        {/* Page Footer */}
        <footer className={styles.pageFooter}>
          <div className={styles.footerContent}>
            <p>이 페이지가 도움이 되었나요?</p>
            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.feedbackButton}
                onClick={() => {
                  // Handle feedback - could integrate with analytics or feedback system
                  console.log('Positive feedback for page:', page.slug);
                }}
              >
                👍 도움됨
              </button>
              <button
                type="button"
                className={styles.feedbackButton}
                onClick={() => {
                  console.log('Negative feedback for page:', page.slug);
                }}
              >
                👎 개선필요
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DefaultTemplate;