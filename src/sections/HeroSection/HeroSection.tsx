import React from 'react'
import { useTranslation } from 'react-i18next'
import ProfessionalCarousel from '../../components/Carousel/ProfessionalCarousel'
import type { CarouselItem } from '../../components/Carousel'
import useLocalizedNavigation from '../../hooks/useLocalizedNavigation'
import styles from './HeroSection.module.css'

const HeroSection: React.FC = () => {
  const { t } = useTranslation()
  const { getLocalizedPath } = useLocalizedNavigation()

  const carouselData: CarouselItem[] = [
    {
      id: '1',
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%230055a5;stop-opacity:1" /><stop offset="100%" style="stop-color:%234a8bc2;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23grad1)"/></svg>',
      title: t('hero.slide1.title'),
      subtitle: t('hero.slide1.subtitle'),
      description: t('hero.slide1.description'),
      cta: {
        text: t('hero.slide1.cta'),
        link: '#contact'
      },
      overlay: true,
      textPosition: 'left'
    },
    {
      id: '2',
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23dac4a5;stop-opacity:1" /><stop offset="100%" style="stop-color:%23c5a883;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23grad2)"/></svg>',
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      description: t('hero.slide2.description'),
      cta: {
        text: t('hero.slide2.cta'),
        link: '#services'
      },
      overlay: true,
      textPosition: 'center'
    },
    {
      id: '3',
      image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23003d7a;stop-opacity:1" /><stop offset="100%" style="stop-color:%230055a5;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23grad3)"/></svg>',
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      description: t('hero.slide3.description'),
      cta: {
        text: t('hero.slide3.cta'),
        link: getLocalizedPath('/reservation')
      },
      overlay: true,
      textPosition: 'right'
    }
  ]

  return (
    <section className={styles.hero} aria-label={t('hero.slide1.subtitle')}>
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