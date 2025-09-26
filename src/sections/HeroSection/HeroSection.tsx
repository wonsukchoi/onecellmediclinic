import React, { useState, useEffect, useCallback } from 'react'
import styles from './HeroSection.module.css'
import type { CarouselItem } from '../../types'

const carouselData: CarouselItem[] = [
  {
    id: '1',
    image: '/assets/hero-bg-1.jpg',
    title: '예쁨 급상승, 원셀 코성형',
    description: '독보적인 이유, 맞춤형 크라이믹으로 오랫동안 자연스럽게'
  },
  {
    id: '2',
    image: '/assets/hero-bg-2.jpg',
    title: '피부과 시그니처, 원셀 피부과',
    description: 'VIP 프리미엄 케어 프로그램'
  },
  {
    id: '3',
    image: '/assets/hero-bg-3.jpg',
    title: '안전이 만든 아름다움',
    description: '3D-CT 정밀 수술 시스템'
  }
]

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % carouselData.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + carouselData.length) % carouselData.length)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide, isAutoPlaying])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  const getSlideClass = (index: number) => {
    const baseClass = styles.carouselSlide
    const bgClass = styles[`bg${index + 1}` as keyof typeof styles] || ''
    return `${baseClass} ${bgClass}`
  }

  return (
    <section
      className={styles.hero}
      aria-label="프로모션"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.carousel}>
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${currentSlide * (100 / carouselData.length)}%)` }}
        >
          {carouselData.map((slide, index) => (
            <div key={slide.id} className={getSlideClass(index)}>
              <div className={styles.heroContent}>
                <p className={styles.eyebrow}>
                  {index === 0 && 'SHORT × SELFIE'}
                  {index === 1 && 'DERM × SCIENCE'}
                  {index === 2 && 'SAFE × PREMIUM'}
                </p>
                {index === 0 ? (
                  <h1>{slide.title}</h1>
                ) : (
                  <h2>{slide.title}</h2>
                )}
                <p>{slide.description}</p>
                <a href="#contact" className={styles.ctaButton}>
                  상담문의
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className={`${styles.carouselNavs} ${styles.prevButton}`}>
          <button
            className={styles.navButton}
            onClick={prevSlide}
            aria-label="이전 슬라이드"
          >
            ←
          </button>
        </div>
        <div className={`${styles.carouselNavs} ${styles.nextButton}`}>
          <button
            className={styles.navButton}
            onClick={nextSlide}
            aria-label="다음 슬라이드"
          >
            →
          </button>
        </div>

        {/* Dots Indicator */}
        <div className={styles.carouselDots}>
          {carouselData.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection