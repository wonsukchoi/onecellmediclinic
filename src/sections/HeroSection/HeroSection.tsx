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

        const response = await DatabaseService.getHeroCarousel()

        if (response.success && response.data) {
          const transformedData: HeroCarouselItem[] = response.data.map((item: HeroCarousel) => ({
            id: item.id,
            image: item.background_image_url,
            title: isKorean ? item.title_kr : item.title_en,
            subtitle: isKorean ? item.subtitle_kr : item.subtitle_en,
            description: isKorean ? item.description_kr : item.description_en,
            cta: {
              text: isKorean ? item.cta_text_kr : item.cta_text_en,
              link: item.cta_link
            },
            overlay: true,
            textPosition: item.text_position
          }))

          setCarouselData(transformedData)
        } else {
          throw new Error(response.error || 'Failed to fetch carousel data')
        }
      } catch (err) {
        console.error('Error fetching hero carousel:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')

        // Fallback to default slides if database fetch fails
        const fallbackData: HeroCarouselItem[] = [
          {
            id: 'fallback-1',
            image: '/images/hero/default-hero.jpg',
            title: isKorean ? '원셀 메디클리닉에 오신 것을 환영합니다' : 'Welcome to OneCell Medical Clinic',
            subtitle: isKorean ? '전문 의료 서비스' : 'Professional Medical Services',
            description: isKorean ? '안전하고 전문적인 의료 서비스를 제공합니다' : 'Providing safe and professional medical services',
            cta: {
              text: isKorean ? '상담 예약' : 'Book Consultation',
              link: '/reservation'
            },
            overlay: true,
            textPosition: 'center'
          }
        ]
        setCarouselData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchCarouselData()
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
        autoplayDelay={6000}
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