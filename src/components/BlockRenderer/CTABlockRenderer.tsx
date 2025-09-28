import React from 'react';
import type { PageBlock } from '../../types';
import styles from './CTABlockRenderer.module.css';

interface CTABlockRendererProps {
  block: PageBlock;
}

const CTABlockRenderer: React.FC<CTABlockRendererProps> = ({ block }) => {
  const { content } = block;

  if (!content?.text || !content?.href) {
    return null;
  }

  const {
    text,
    href,
    target = '_self',
    style = 'primary',
    size = 'medium',
    alignment = 'center',
    description,
    icon,
    fullWidth = false
  } = content;

  const buttonClassName = `
    ${styles.ctaButton}
    ${styles[`style--${style}`]}
    ${styles[`size--${size}`]}
    ${fullWidth ? styles['full-width'] : ''}
  `.trim();

  const containerClassName = `
    ${styles.ctaContainer}
    ${styles[`align--${alignment}`]}
  `.trim();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Track CTA clicks if analytics is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        event_category: 'CTA',
        event_label: text,
        value: 1
      });
    }

    // Handle internal links
    if (href.startsWith('/') && target === '_self') {
      event.preventDefault();
      window.location.href = href;
    }
  };

  return (
    <div className={containerClassName}>
      {description && (
        <div className={styles.description}>
          {description}
        </div>
      )}
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={buttonClassName}
        onClick={handleClick}
        aria-label={text}
      >
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={styles.text}>{text}</span>
      </a>
    </div>
  );
};

export default CTABlockRenderer;