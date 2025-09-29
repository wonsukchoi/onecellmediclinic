import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade, Thumbs } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import BlurText from '../BlurText'

// Note: Swiper styles will be handled by the CSS module

import styles from './ProfessionalCarousel.module.css'

export interface CarouselItem {
  id: string
  image: string
  title?: string
  subtitle?: string
  description?: string
  cta?: {
    text: string
    link: string
    external?: boolean
  }
  overlay?: boolean
  textPosition?: 'left' | 'center' | 'right'
}

interface ProfessionalCarouselProps {
  items: CarouselItem[]
  autoplay?: boolean
  autoplayDelay?: number
  effect?: 'slide' | 'fade'
  showThumbs?: boolean
  showNavigation?: boolean
  showPagination?: boolean
  height?: string
  className?: string
  onSlideChange?: (activeIndex: number) => void
}

const ProfessionalCarousel: React.FC<ProfessionalCarouselProps> = ({
  items,
  autoplay = true,
  autoplayDelay = 5000,
  effect = 'fade',
  showThumbs = false,
  showNavigation = true,
  showPagination = true,
  height = '60vh',
  className,
  onSlideChange
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null)

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex)
    onSlideChange?.(swiper.activeIndex)
  }

  const handleCTAClick = (cta: CarouselItem['cta']) => {
    if (!cta) return

    if (cta.external) {
      window.open(cta.link, '_blank', 'noopener,noreferrer')
    } else if (cta.link.startsWith('#')) {
      const element = document.querySelector(cta.link)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.location.href = cta.link
    }
  }

  const swiperModules = [Navigation, Pagination, Autoplay]
  if (effect === 'fade') {
    swiperModules.push(EffectFade)
  }
  if (showThumbs) {
    swiperModules.push(Thumbs)
  }

  const carouselClasses = [
    styles.professionalCarousel,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={carouselClasses} style={{ height }}>
      {/* Main Carousel */}
      <Swiper
        modules={swiperModules}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={autoplay ? {
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        } : false}
        effect={effect}
        fadeEffect={effect === 'fade' ? {
          crossFade: true
        } : undefined}
        navigation={showNavigation ? {
          nextEl: `.${styles.navNext}`,
          prevEl: `.${styles.navPrev}`,
        } : false}
        pagination={showPagination ? {
          el: `.${styles.pagination}`,
          clickable: true,
          renderBullet: (index, className) => {
            return `<button class="${className} ${styles.paginationBullet}" aria-label="Go to slide ${index + 1}">
              <span class="${styles.bulletProgress}"></span>
            </button>`
          }
        } : false}
        thumbs={showThumbs && thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
        onSlideChange={handleSlideChange}
        onSwiper={setMainSwiper}
        className={styles.mainSwiper}
        loop={items.length > 1}
        speed={600}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id} className={styles.slide}>
            <div className={styles.slideContainer}>
              <div className={styles.imageContainer}>
                <img
                  src={item.image}
                  alt={item.title || `Slide ${index + 1}`}
                  className={styles.slideImage}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {item.overlay && <div className={styles.slideOverlay} />}
              </div>

              {(item.title || item.subtitle || item.description || item.cta) && (
                <div
                  className={`${styles.slideContent} ${
                    styles[`content-${item.textPosition || 'center'}`]
                  }`}
                >
                  <div className={styles.contentInner}>
                    {item.subtitle && (
                      <BlurText 
                        text={item.subtitle}
                        delay={150}
                        animateBy="words"
                        direction="top"
                        className={styles.slideSubtitle}
                      />
                    )}
                    {item.title && (
                      <BlurText 
                        text={item.title}
                        delay={200}
                        animateBy="words"
                        direction="top"
                        className={styles.slideTitle}
                      />
                    )}
                    {item.description && (
                      <BlurText 
                        text={item.description}
                        delay={250}
                        animateBy="words"
                        direction="top"
                        className={styles.slideDescription}
                      />
                    )}
                    {item.cta && (
                      <button
                        className={styles.slideCta}
                        onClick={() => handleCTAClick(item.cta)}
                        type="button"
                      >
                        <span>{item.cta.text}</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M4.16675 10H15.8334M15.8334 10L10.8334 5M15.8334 10L10.8334 15"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Controls */}
      {showNavigation && (
        <>
          <button className={`${styles.navButton} ${styles.navPrev}`} aria-label="Previous slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className={`${styles.navButton} ${styles.navNext}`} aria-label="Next slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className={styles.pagination} />
      )}

      {/* Thumbnail Navigation */}
      {showThumbs && items.length > 1 && (
        <div className={styles.thumbsContainer}>
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[Navigation, Thumbs]}
            className={styles.thumbsSwiper}
            breakpoints={{
              640: {
                slidesPerView: 5,
              },
              768: {
                slidesPerView: 6,
              },
              1024: {
                slidesPerView: 8,
              },
            }}
          >
            {items.map((item, index) => (
              <SwiperSlide key={`thumb-${item.id}`} className={styles.thumbSlide}>
                <button
                  className={`${styles.thumbButton} ${activeIndex === index ? styles.active : ''}`}
                  onClick={() => mainSwiper?.slideTo(index)}
                  aria-label={`Go to slide ${index + 1}: ${item.title || 'Untitled'}`}
                >
                  <img
                    src={item.image}
                    alt={item.title || `Thumbnail ${index + 1}`}
                    className={styles.thumbImage}
                  />
                  <div className={styles.thumbOverlay} />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div
          className={styles.progressBar}
          style={{
            width: `${((activeIndex + 1) / items.length) * 100}%`
          }}
        />
      </div>
    </div>
  )
}

export default ProfessionalCarousel