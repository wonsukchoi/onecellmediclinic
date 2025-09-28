import React, { useState } from 'react';
import type { PageBlock } from '../../types';
import styles from './GalleryBlockRenderer.module.css';

interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
  thumbnail?: string;
}

interface GalleryBlockRendererProps {
  block: PageBlock;
}

const GalleryBlockRenderer: React.FC<GalleryBlockRendererProps> = ({ block }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { content } = block;

  if (!content?.images || !Array.isArray(content.images) || content.images.length === 0) {
    return null;
  }

  const {
    images,
    layout = 'grid',
    columns = 3,
    showCaptions = true,
    enableLightbox = true
  } = content;

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setSelectedImage(index);
      setIsLightboxOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = selectedImage > 0 ? selectedImage - 1 : images.length - 1;
    } else {
      newIndex = selectedImage < images.length - 1 ? selectedImage + 1 : 0;
    }

    setSelectedImage(newIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isLightboxOpen) return;

    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigateLightbox('prev');
        break;
      case 'ArrowRight':
        navigateLightbox('next');
        break;
    }
  };

  const gridStyle = {
    '--gallery-columns': columns,
    '--gallery-gap': '1rem'
  } as React.CSSProperties;

  return (
    <div className={styles.galleryContainer} onKeyDown={handleKeyDown} tabIndex={0}>
      <div
        className={`${styles.gallery} ${styles[`layout--${layout}`]}`}
        style={gridStyle}
      >
        {images.map((image: GalleryImage, index: number) => (
          <div key={index} className={styles.galleryItem}>
            <div
              className={styles.imageWrapper}
              onClick={() => openLightbox(index)}
              style={{ cursor: enableLightbox ? 'pointer' : 'default' }}
            >
              <img
                src={image.thumbnail || image.src}
                alt={image.alt || `갤러리 이미지 ${index + 1}`}
                loading="lazy"
                className={styles.galleryImage}
              />
              {enableLightbox && (
                <div className={styles.overlay}>
                  <div className={styles.zoomIcon}>🔍</div>
                </div>
              )}
            </div>
            {showCaptions && image.caption && (
              <div className={styles.caption}>
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && selectedImage !== null && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={closeLightbox}
              aria-label="갤러리 닫기"
            >
              ✕
            </button>

            {images.length > 1 && (
              <>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={() => navigateLightbox('prev')}
                  aria-label="이전 이미지"
                >
                  ‹
                </button>
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={() => navigateLightbox('next')}
                  aria-label="다음 이미지"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={images[selectedImage].src}
              alt={images[selectedImage].alt || `이미지 ${selectedImage + 1}`}
              className={styles.lightboxImage}
            />

            {images[selectedImage].caption && (
              <div className={styles.lightboxCaption}>
                {images[selectedImage].caption}
              </div>
            )}

            {images.length > 1 && (
              <div className={styles.imageCounter}>
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryBlockRenderer;