import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ProfessionalCarousel from '../../components/Carousel/ProfessionalCarousel'
import type { CarouselItem } from '../../components/Carousel'
import type { HeroCarousel, HeroCarouselItem } from '../../types'
import { DatabaseService } from '../../services/supabase'
import useLocalizedNavigation from '../../hooks/useLocalizedNavigation'
import styles from './HeroSection.module.css'

const HeroSection: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { getLocalizedPath } = useLocalizedNavigation()
  const [carouselData, setCarouselData] = useState<HeroCarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentLanguage = i18n.language
  const isKorean = currentLanguage === 'kr'

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Create the fallback data that we'll always use
        const fallbackData: HeroCarouselItem[] = [
          {
            id: 'fallback-1',
            image: '/images/hero/default-hero.jpg',
            // Removed all text and buttons
            overlay: false
          },
          {
            id: 'wellness-solution',
            image: '/images/hero/20250930_onecell_banner_1.png',
            overlay: false
          }
        ]
        setCarouselData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchCarouselData() // This will now always use our fallback data with the wellness solution slide
  }, [isKorean])

  if (loading) {
    return (
      <section className={styles.hero} aria-label={t('hero.loading')}>
        <div className={styles.loading}>
          <p>{t('hero.loading')}</p>
        </div>
      </section>
    )
  }

  if (error && carouselData.length === 0) {
    return (
      <section className={styles.hero} aria-label={t('hero.error')}>
        <div className={styles.error}>
          <p>{t('hero.error')}</p>
          <button onClick={() => window.location.reload()}>
            {t('hero.retry')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.hero} aria-label={carouselData.length > 0 ? carouselData[0].subtitle : ''}>
      <ProfessionalCarousel
        items={carouselData}
        autoplay={true}
        autoplayDelay={5000}
        effect="fade"
        showNavigation={true}
        showPagination={true}
        height="70vh"
        className={styles.heroCarousel}
      />
    </section>
  )
}

export default HeroSection