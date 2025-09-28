import React from 'react';
import DOMPurify from 'dompurify';
import type { PageBlock } from '../../types';
import styles from './TextBlockRenderer.module.css';

interface TextBlockRendererProps {
  block: PageBlock;
}

const TextBlockRenderer: React.FC<TextBlockRendererProps> = ({ block }) => {
  const { content } = block;

  if (!content?.html) {
    return null;
  }

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedHTML = DOMPurify.sanitize(content.html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'colspan', 'rowspan'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
  });

  const textAlignment = content.alignment || 'left';
  const fontSize = content.fontSize || 'medium';
  const textColor = content.textColor || '';

  const className = `${styles.textBlock} ${styles[`align--${textAlignment}`]} ${styles[`size--${fontSize}`]}`;

  const inlineStyles: React.CSSProperties = {
    ...(textColor && { color: textColor })
  };

  return (
    <div
      className={className}
      style={inlineStyles}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export default TextBlockRenderer;