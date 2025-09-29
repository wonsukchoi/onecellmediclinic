import React from 'react';
import type { DynamicPage } from '../../types';
import BlockRenderer from '../BlockRenderer/BlockRenderer';
import styles from './LandingTemplate.module.css';

interface LandingTemplateProps {
  page: DynamicPage;
  className?: string;
}

const LandingTemplate: React.FC<LandingTemplateProps> = ({ page, className }) => {
  const blocks = page.blocks || [];
  const sortedBlocks = blocks.sort((a, b) => a.sort_order - b.sort_order);

  // Separate hero block from content blocks (assuming first block is hero)
  const heroBlock = sortedBlocks[0];
  const contentBlocks = sortedBlocks.slice(1);

  return (
    <div className={`${styles.landingTemplate} ${className || ''}`}>
      {/* Hero Section */}
      {heroBlock && (
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            {page.featured_image && (
              <div className={styles.heroBackground}>
                <img
                  src={page.featured_image}
                  alt={page.title}
                  loading="eager"
                />
                <div className={styles.heroOverlay}></div>
              </div>
            )}
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>{page.title}</h1>
              {page.description && (
                <p className={styles.heroDescription}>{page.description}</p>
              )}
              <BlockRenderer
                block={heroBlock}
                className={styles.heroBlock}
              />
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      {contentBlocks.length > 0 && (
        <main className={styles.contentSections}>
          <div className={styles.container}>
            {contentBlocks.map((block, index) => (
              <section
                key={block.id}
                className={`${styles.contentSection} ${
                  index % 2 === 1 ? styles.alternateSection : ''
                }`}
              >
                <BlockRenderer block={block} />
              </section>
            ))}
          </div>
        </main>
      )}

      {/* Call-to-Action Footer */}
      <footer className={styles.ctaFooter}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>상담 예약하기</h2>
            <p>전문의와의 1:1 상담을 통해 맞춤형 치료 계획을 받아보세요.</p>
            <div className={styles.ctaButtons}>
              <a href="/consultation" className={styles.primaryCta}>
                온라인 상담
              </a>
              <a href="/reservation" className={styles.secondaryCta}>
                예약하기
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button removed in favor of ConsultationSidebar */}
    </div>
  );
};

export default LandingTemplate;