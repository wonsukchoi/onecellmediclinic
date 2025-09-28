import React, { useState } from 'react';
import type { PageBlock } from '../../types';
import styles from './ImageBlockRenderer.module.css';

interface ImageBlockRendererProps {
  block: PageBlock;
}

const ImageBlockRenderer: React.FC<ImageBlockRendererProps> = ({ block }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { content } = block;

  if (!content?.src) {
    return null;
  }

  const {
    src,
    alt = '',
    caption,
    width,
    height,
    alignment = 'center',
    link,
    linkTarget = '_self',
    lazy = true
  } = content;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const imageElement = (
    <div className={`${styles.imageWrapper} ${styles[`align--${alignment}`]}`}>
      {isLoading && (
        <div className={styles.imagePlaceholder}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
      {hasError ? (
        <div className={styles.imageError}>
          <span>이미지를 불러올 수 없습니다</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={styles.image}
          style={{
            display: isLoading ? 'none' : 'block'
          }}
        />
      )}
      {caption && (
        <figcaption className={styles.caption}>
          {caption}
        </figcaption>
      )}
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        target={linkTarget}
        rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
        className={styles.imageLink}
      >
        {imageElement}
      </a>
    );
  }

  return imageElement;
};

export default ImageBlockRenderer;