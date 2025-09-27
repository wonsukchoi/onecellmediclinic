import React, { useState } from 'react'
import styles from './FacilityTourPage.module.css'

interface FacilityItem {
  id: string
  title: string
  description: string
  image: string
  category: 'reception' | 'consultation' | 'treatment' | 'surgery' | 'recovery' | 'equipment'
  features: string[]
  specifications?: Record<string, string>
}

// Mock facility data - in a real app, this would come from the database
const facilityData: FacilityItem[] = [
  {
    id: '1',
    title: '리셉션 & 웰컴 라운지',
    description: '편안하고 세련된 대기 공간에서 여유로운 시간을 보내세요.',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f8f9fa;stop-opacity:1" /><stop offset="100%" style="stop-color:%23e9ecef;stop-opacity:1" /></linearGradient></defs><rect width="800" height="600" fill="url(%23grad1)"/><rect x="50" y="100" width="700" height="400" fill="%23ffffff" stroke="%23dee2e6" stroke-width="2" rx="20"/><text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="24" fill="%23495057">Reception & Lounge</text></svg>',
    category: 'reception',
    features: ['프리미엄 인테리어', 'VIP 대기실', '무료 음료 서비스', '편안한 소파', 'Wi-Fi 완비']
  },
  {
    id: '2',
    title: '전문의 상담실',
    description: '프라이버시가 보장되는 개별 상담실에서 전문의와 1:1 상담을 받으세요.',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23e3f2fd;stop-opacity:1" /><stop offset="100%" style="stop-color:%23bbdefb;stop-opacity:1" /></linearGradient></defs><rect width="800" height="600" fill="url(%23grad2)"/><rect x="50" y="100" width="700" height="400" fill="%23ffffff" stroke="%232196f3" stroke-width="2" rx="20"/><text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="24" fill="%231976d2">Consultation Room</text></svg>',
    category: 'consultation',
    features: ['개별 상담실', '최신 진단 장비', '편안한 분위기', '프라이버시 보장', '전문의 상주']
  },
  {
    id: '3',
    title: '시술실',
    description: '최첨단 장비와 무균 환경에서 안전한 시술이 이루어집니다.',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23e8f5e8;stop-opacity:1" /><stop offset="100%" style="stop-color:%23c8e6c9;stop-opacity:1" /></linearGradient></defs><rect width="800" height="600" fill="url(%23grad3)"/><rect x="50" y="100" width="700" height="400" fill="%23ffffff" stroke="%234caf50" stroke-width="2" rx="20"/><text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="24" fill="%23388e3c">Treatment Room</text></svg>',
    category: 'treatment',
    features: ['무균 시설', '최신 레이저 장비', '안전 시스템', '편안한 침대', '온도 조절']
  },
  {
    id: '4',
    title: '수술실',
    description: '국제 기준의 무균 수술실에서 안전하고 정밀한 수술이 진행됩니다.',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23fff3e0;stop-opacity:1" /><stop offset="100%" style="stop-color:%23ffe0b2;stop-opacity:1" /></linearGradient></defs><rect width="800" height="600" fill="url(%23grad4)"/><rect x="50" y="100" width="700" height="400" fill="%23ffffff" stroke="%23ff9800" stroke-width="2" rx="20"/><text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="24" fill="%23f57c00">Surgery Room</text></svg>',
    category: 'surgery',
    features: ['Class 100 청정실', '3D-CT 시스템', '응급 시설 완비', '마취 전문의', '24시간 모니터링'],
    specifications: {
      '청정도': 'ISO 14644-1 Class 100',
      '온도': '20-24°C 유지',
      '습도': '50-60% 유지',
      '기압': '양압 유지'
    }
  },
  {
    id: '5',
    title: '회복실',
    description: '시술 후 편안한 휴식을 위한 전용 회복 공간입니다.',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f3e5f5;stop-opacity:1" /><stop offset="100%" style="stop-color:%23e1bee7;stop-opacity:1" /></linearGradient></defs><rect width="800" height="600" fill="url(%23grad5)"/><rect x="50" y="100" width="700" height="400" fill="%23ffffff" stroke="%239c27b0" stroke-width="2" rx="20"/><text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="24" fill="%237b1fa2">Recovery Room</text></svg>',
    category: 'recovery',
    features: ['개별 회복실', '간병 서비스', '응급 호출 시스템', '편안한 침대', '조용한 환경']
  },
  {
    id: '6',
    title: '첨단 의료 장비실',
    description: '최신 의료 장비로 정확한 진단과 안전한 치료를 제공합니다.',
    image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23e0f2f1;stop-opacity:1" /><stop offset="100%" style="stop-color:%23b2dfdb;stop-opacity:1" /></linearGradient></defs><rect width="800" height="600" fill="url(%23grad6)"/><rect x="50" y="100" width="700" height="400" fill="%23ffffff" stroke="%23009688" stroke-width="2" rx="20"/><text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="24" fill="%2300695c">Medical Equipment</text></svg>',
    category: 'equipment',
    features: ['3D-CT 스캐너', '최신 레이저 장비', 'MRI 시설', '초음파 장비', '내시경 시설'],
    specifications: {
      '3D-CT': '64채널 최신형',
      '레이저': 'CO2 프랙셔널',
      'MRI': '1.5T 고해상도',
      '초음파': '4D 실시간'
    }
  }
]

const categories = [
  { id: 'all', name: '전체', icon: '🏥' },
  { id: 'reception', name: '리셉션', icon: '🛋️' },
  { id: 'consultation', name: '상담실', icon: '👨‍⚕️' },
  { id: 'treatment', name: '시술실', icon: '💎' },
  { id: 'surgery', name: '수술실', icon: '⚕️' },
  { id: 'recovery', name: '회복실', icon: '🛏️' },
  { id: 'equipment', name: '장비실', icon: '🔬' }
]

const FacilityTourPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null)

  const filteredFacilities = selectedCategory === 'all'
    ? facilityData
    : facilityData.filter(facility => facility.category === selectedCategory)

  const openFacilityModal = (facility: FacilityItem) => {
    setSelectedFacility(facility)
    document.body.style.overflow = 'hidden'
  }

  const closeFacilityModal = () => {
    setSelectedFacility(null)
    document.body.style.overflow = 'auto'
  }

  const getCategoryIcon = (category: string) => {
    const categoryItem = categories.find(cat => cat.id === category)
    return categoryItem?.icon || '🏥'
  }

  return (
    <div className={styles.facilityPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>시설 둘러보기</h1>
            <p className={styles.heroDescription}>
              최첨단 의료 장비와 편안한 환경이 조화를 이룬<br />
              원셀 메디클리닉의 모든 시설을 가상으로 둘러보세요.
            </p>
            <div className={styles.heroFeatures}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🏥</span>
                <span className={styles.featureText}>최신 시설</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🔬</span>
                <span className={styles.featureText}>첨단 장비</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🛡️</span>
                <span className={styles.featureText}>안전 시스템</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Tour Section */}
      <section className={styles.tourSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>가상 투어</h2>
            <p className={styles.sectionSubtitle}>
              원셀 메디클리닉의 각 공간을 카테고리별로 살펴보세요.
            </p>
          </div>

          {/* Category Filter */}
          <div className={styles.categoryFilter}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${
                  selectedCategory === category.id ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Facilities Grid */}
          <div className={styles.facilitiesGrid}>
            {filteredFacilities.map((facility, index) => (
              <div
                key={facility.id}
                className={styles.facilityCard}
                style={{'--delay': `${index * 0.1}s`} as React.CSSProperties}
                onClick={() => openFacilityModal(facility)}
              >
                <div className={styles.cardImage}>
                  <img src={facility.image} alt={facility.title} />
                  <div className={styles.cardOverlay}>
                    <span className={styles.categoryBadge}>
                      {getCategoryIcon(facility.category)}
                    </span>
                    <div className={styles.overlayContent}>
                      <h3>{facility.title}</h3>
                      <p>자세히 보기</p>
                    </div>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{facility.title}</h3>
                  <p className={styles.cardDescription}>{facility.description}</p>

                  <div className={styles.cardFeatures}>
                    {facility.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className={styles.featureTag}>
                        {feature}
                      </span>
                    ))}
                    {facility.features.length > 3 && (
                      <span className={styles.moreFeatures}>
                        +{facility.features.length - 3}개 더
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFacilities.length === 0 && (
            <div className={styles.noResults}>
              <p>해당 카테고리에 시설이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <div className={styles.modal} onClick={closeFacilityModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeFacilityModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.modalImage}>
              <img src={selectedFacility.image} alt={selectedFacility.title} />
              <div className={styles.modalImageOverlay}>
                <span className={styles.modalCategoryBadge}>
                  {getCategoryIcon(selectedFacility.category)}
                </span>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{selectedFacility.title}</h2>
                <p className={styles.modalDescription}>{selectedFacility.description}</p>
              </div>

              <div className={styles.modalSection}>
                <h3>주요 특징</h3>
                <div className={styles.modalFeatures}>
                  {selectedFacility.features.map((feature, index) => (
                    <div key={index} className={styles.modalFeatureItem}>
                      <span className={styles.modalFeatureIcon}>✓</span>
                      <span className={styles.modalFeatureText}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedFacility.specifications && (
                <div className={styles.modalSection}>
                  <h3>기술 사양</h3>
                  <div className={styles.modalSpecs}>
                    {Object.entries(selectedFacility.specifications).map(([key, value]) => (
                      <div key={key} className={styles.modalSpecItem}>
                        <span className={styles.modalSpecLabel}>{key}</span>
                        <span className={styles.modalSpecValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button className={styles.tourButton}>
                  360° 가상 투어
                </button>
                <button className={styles.consultButton}>
                  상담 예약하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Standards Section */}
      <section className={styles.safetySection}>
        <div className={styles.container}>
          <div className={styles.safetyContent}>
            <h2 className={styles.safetyTitle}>안전 기준 및 인증</h2>
            <div className={styles.safetyGrid}>
              <div className={styles.safetyItem}>
                <div className={styles.safetyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22S2 16 2 10C2 5.58172 5.58172 2 10 2C10.81 2 11.58 2.15 12.29 2.41C12.66 2.55 13 2.73 13.29 2.95C14.43 3.77 15.3 4.95 15.71 6.34C15.9 6.89 16 7.44 16 8C16 10.09 14.66 11.86 12.83 12.65C12.58 12.77 12.31 12.85 12.02 12.91C11.68 12.97 11.34 13 11 13H10C8.9 13 8 12.1 8 11V9C8 7.9 8.9 7 10 7H12C13.1 7 14 7.9 14 9V10C14 11.1 13.1 12 12 12S10 11.1 10 10V9.5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>의료기관 인증</h3>
                <p>보건복지부 인증 의료기관으로 엄격한 안전 기준을 준수합니다.</p>
              </div>
              <div className={styles.safetyItem}>
                <div className={styles.safetyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>국제 표준</h3>
                <p>ISO 14644-1 Class 100 청정실 등 국제 표준을 준수합니다.</p>
              </div>
              <div className={styles.safetyItem}>
                <div className={styles.safetyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>품질 관리</h3>
                <p>지속적인 품질 관리 시스템으로 최고 수준의 안전성을 보장합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>직접 방문해 보세요</h2>
            <p>온라인으로 둘러본 시설을 직접 방문하여 체험해보실 수 있습니다.</p>
            <div className={styles.ctaButtons}>
              <a href="/reservation" className={styles.primaryButton}>
                방문 예약하기
              </a>
              <a href="#contact" className={styles.secondaryButton}>
                오시는 길
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FacilityTourPage