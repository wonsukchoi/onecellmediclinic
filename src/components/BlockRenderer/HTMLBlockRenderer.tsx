import React from 'react';
import DOMPurify from 'dompurify';
import type { PageBlock } from '../../types';
import styles from './HTMLBlockRenderer.module.css';

interface HTMLBlockRendererProps {
  block: PageBlock;
}

const HTMLBlockRenderer: React.FC<HTMLBlockRendererProps> = ({ block }) => {
  const { content } = block;

  if (!content?.html) {
    return null;
  }

  const {
    html,
    allowScripts = false,
    sanitize = true,
    customCSS
  } = content;

  // Configure DOMPurify based on security settings
  const sanitizeOptions = sanitize ? {
    // Allow more HTML elements for advanced content
    ALLOWED_TAGS: [
      'div', 'span', 'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
      'form', 'input', 'textarea', 'select', 'option', 'button', 'label',
      'iframe', 'video', 'audio', 'source', 'track',
      'article', 'section', 'header', 'footer', 'nav', 'aside', 'main',
      'details', 'summary', 'dialog', 'canvas'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'style', 'data-*', 'aria-*', 'role',
      'href', 'target', 'rel', 'title', 'alt', 'src', 'width', 'height',
      'colspan', 'rowspan', 'type', 'name', 'value', 'placeholder',
      'controls', 'autoplay', 'muted', 'loop', 'poster',
      'frameborder', 'allowfullscreen', 'allow'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
    FORBID_ATTR: allowScripts ? [] : ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ALLOW_DATA_ATTR: true,
    ALLOW_ARIA_ATTR: true
  } : undefined;

  const processedHTML = sanitize ? DOMPurify.sanitize(html, sanitizeOptions) : html;

  // Warning for unsanitized content
  if (!sanitize) {
    console.warn('HTMLBlockRenderer: Rendering unsanitized HTML content. This may pose security risks.');
  }

  return (
    <div className={styles.htmlBlock}>
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}
      <div
        className={styles.htmlContent}
        dangerouslySetInnerHTML={{ __html: processedHTML }}
      />
    </div>
  );
};

export default HTMLBlockRenderer;