import React from 'react';
import type { DynamicPage } from '../../types';
import BlockRenderer from '../BlockRenderer/BlockRenderer';
import styles from './ArticleTemplate.module.css';

interface ArticleTemplateProps {
  page: DynamicPage;
  className?: string;
}

const ArticleTemplate: React.FC<ArticleTemplateProps> = ({ page, className }) => {
  const blocks = page.blocks || [];
  const sortedBlocks = blocks.sort((a, b) => a.sort_order - b.sort_order);

  // Generate table of contents from heading blocks
  const tableOfContents = sortedBlocks
    .filter(block => block.block_type === 'text' && block.title)
    .map((block, index) => ({
      id: `section-${index}`,
      title: block.title!,
      level: 1 // Could be enhanced to detect heading levels
    }));

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`${styles.articleTemplate} ${className || ''}`}>
      <div className={styles.container}>
        {/* Article Header */}
        <header className={styles.articleHeader}>
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
            <div className={styles.articleMeta}>
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
              <span className={styles.readingTime}>
                {Math.max(1, Math.floor(blocks.length * 0.5))}분 읽기
              </span>
            </div>
            <h1 className={styles.articleTitle}>{page.title}</h1>
            {page.description && (
              <p className={styles.articleSummary}>{page.description}</p>
            )}
          </div>
        </header>

        <div className={styles.articleBody}>
          {/* Table of Contents */}
          {tableOfContents.length > 2 && (
            <aside className={styles.tableOfContents}>
              <h2>목차</h2>
              <ul>
                {tableOfContents.map((item, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={styles.tocLink}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Article Content */}
          <main className={styles.articleContent}>
            {sortedBlocks.map((block) => (
              <div
                key={block.id}
                id={block.title ? `section-${tableOfContents.findIndex(toc => toc.title === block.title)}` : undefined}
                className={styles.contentSection}
              >
                <BlockRenderer block={block} />
              </div>
            ))}
          </main>
        </div>

        {/* Article Footer */}
        <footer className={styles.articleFooter}>
          {/* Keywords/Tags */}
          {page.keywords && (
            <div className={styles.articleTags}>
              <h3>관련 태그</h3>
              <div className={styles.tags}>
                {page.keywords.split(',').map((keyword, index) => (
                  <span key={index} className={styles.tag}>
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Sharing */}
          <div className={styles.socialSharing}>
            <h3>공유하기</h3>
            <div className={styles.shareButtons}>
              <button
                type="button"
                className={styles.shareButton}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: page.title,
                      text: page.description || '',
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('링크가 복사되었습니다.');
                  }
                }}
              >
                🔗 링크 복사
              </button>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                📘 Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(page.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
              >
                🐦 Twitter
              </a>
            </div>
          </div>

          {/* Related Content */}
          <div className={styles.relatedContent}>
            <h3>관련 페이지</h3>
            <div className={styles.relatedLinks}>
              <a href="/procedures" className={styles.relatedLink}>
                시술 안내
              </a>
              <a href="/consultation" className={styles.relatedLink}>
                온라인 상담
              </a>
              <a href="/reservation" className={styles.relatedLink}>
                예약하기
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ArticleTemplate;