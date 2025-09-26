import React from 'react'
import ProfessionalCarousel from '../../components/Carousel/ProfessionalCarousel'
import type { CarouselItem } from '../../components/Carousel'
import styles from './HeroSection.module.css'

const carouselData: CarouselItem[] = [
  {
    id: '1',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%230055a5;stop-opacity:1" /><stop offset="100%" style="stop-color:%234a8bc2;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23grad1)"/></svg>',
    title: '예쁨 급상승, 원셀 코성형',
    subtitle: 'SHORT × SELFIE',
    description: '독보적인 이유, 맞춤형 코성형으로 오랫동안 자연스럽게',
    cta: {
      text: '상담문의',
      link: '#contact'
    },
    overlay: true,
    textPosition: 'left'
  },
  {
    id: '2',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23dac4a5;stop-opacity:1" /><stop offset="100%" style="stop-color:%23c5a883;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23grad2)"/></svg>',
    title: '피부과 시그니처, 원셀 피부과',
    subtitle: 'DERM × SCIENCE',
    description: 'VIP 프리미엄 케어 프로그램',
    cta: {
      text: '더 알아보기',
      link: '#services'
    },
    overlay: true,
    textPosition: 'center'
  },
  {
    id: '3',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23003d7a;stop-opacity:1" /><stop offset="100%" style="stop-color:%230055a5;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23grad3)"/></svg>',
    title: '안전이 만든 아름다움',
    subtitle: 'SAFE × PREMIUM',
    description: '3D-CT 정밀 수술 시스템으로 더욱 안전하고 정밀한 시술',
    cta: {
      text: '예약하기',
      link: '/reservation'
    },
    overlay: true,
    textPosition: 'right'
  }
]

const HeroSection: React.FC = () => {
  return (
    <section className={styles.hero} aria-label="프로모션">
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