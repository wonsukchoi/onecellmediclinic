import React, { useState } from 'react';
import type { DynamicPage } from '../../types';
import BlockRenderer from '../BlockRenderer/BlockRenderer';
import styles from './GalleryTemplate.module.css';

interface GalleryTemplateProps {
  page: DynamicPage;
  className?: string;
}

const GalleryTemplate: React.FC<GalleryTemplateProps> = ({ page, className }) => {
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const blocks = page.blocks || [];
  const sortedBlocks = blocks.sort((a, b) => a.sort_order - b.sort_order);

  // Separate gallery blocks from other content
  const galleryBlocks = sortedBlocks.filter(block => block.block_type === 'gallery');
  const contentBlocks = sortedBlocks.filter(block => block.block_type !== 'gallery');

  // Extract categories from block titles or content
  const categories = ['all', ...new Set(galleryBlocks.map(block => block.title || '기타').filter(Boolean))];

  const filteredGalleryBlocks = currentFilter === 'all'
    ? galleryBlocks
    : galleryBlocks.filter(block => block.title === currentFilter);

  return (
    <div className={`${styles.galleryTemplate} ${className || ''}`}>
      <div className={styles.container}>
        {/* Gallery Header */}
        <header className={styles.galleryHeader}>
          {page.featured_image && (
            <div className={styles.headerBackground}>
              <img
                src={page.featured_image}
                alt={page.title}
                loading="eager"
              />
              <div className={styles.headerOverlay}></div>
            </div>
          )}
          <div className={styles.headerContent}>
            <h1 className={styles.galleryTitle}>{page.title}</h1>
            {page.description && (
              <p className={styles.galleryDescription}>{page.description}</p>
            )}
            <div className={styles.galleryMeta}>
              <span className={styles.imageCount}>
                총 {galleryBlocks.reduce((count, block) => {
                  const images = block.content?.images || [];
                  return count + images.length;
                }, 0)}개의 이미지
              </span>
              {page.published_at && (
                <time dateTime={page.published_at} className={styles.publishDate}>
                  {new Date(page.published_at).toLocaleDateString('ko-KR')}
                </time>
              )}
            </div>
          </div>
        </header>

        {/* Gallery Filters */}
        {categories.length > 2 && (
          <nav className={styles.galleryFilters}>
            <div className={styles.filterButtons}>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`${styles.filterButton} ${
                    currentFilter === category ? styles.active : ''
                  }`}
                  onClick={() => setCurrentFilter(category)}
                >
                  {category === 'all' ? '전체' : category}
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Content Blocks (non-gallery) */}
        {contentBlocks.length > 0 && (
          <section className={styles.contentSection}>
            {contentBlocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </section>
        )}

        {/* Gallery Grid */}
        <main className={styles.galleryGrid}>
          {filteredGalleryBlocks.length > 0 ? (
            filteredGalleryBlocks.map((block) => (
              <section key={block.id} className={styles.gallerySection}>
                {block.title && currentFilter === 'all' && (
                  <h2 className={styles.sectionTitle}>{block.title}</h2>
                )}
                <BlockRenderer
                  block={block}
                  className={styles.galleryBlock}
                />
              </section>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>선택한 카테고리에 이미지가 없습니다.</p>
              <button
                type="button"
                onClick={() => setCurrentFilter('all')}
                className={styles.resetFilter}
              >
                전체 보기
              </button>
            </div>
          )}
        </main>

        {/* Gallery Stats */}
        <aside className={styles.galleryStats}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <h3>전체 이미지</h3>
              <p>{galleryBlocks.reduce((count, block) => {
                const images = block.content?.images || [];
                return count + images.length;
              }, 0)}</p>
            </div>
            <div className={styles.statItem}>
              <h3>갤러리 수</h3>
              <p>{galleryBlocks.length}</p>
            </div>
            <div className={styles.statItem}>
              <h3>조회수</h3>
              <p>{page.view_count}</p>
            </div>
          </div>
        </aside>

        {/* Gallery Footer */}
        <footer className={styles.galleryFooter}>
          <div className={styles.footerContent}>
            <h3>더 많은 갤러리 보기</h3>
            <div className={styles.footerActions}>
              <a href="/reviews" className={styles.footerLink}>
                셀피 리뷰
              </a>
              <a href="/events" className={styles.footerLink}>
                이벤트 갤러리
              </a>
              <a href="/procedures" className={styles.footerLink}>
                시술 갤러리
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default GalleryTemplate;