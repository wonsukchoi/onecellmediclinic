import React, { useState, useEffect, useRef } from 'react'
import { ContentFeaturesService } from '../../services/features.service'
import styles from './ClinicFeaturesSection.module.css'

interface ClinicFeature {
  id: number
  title: string
  description?: string
  icon_url?: string
  image_url?: string
  category: string
  stats_number?: string
  stats_label?: string
}

interface ClinicFeaturesProps {
  title?: string
  subtitle?: string
  showCategories?: boolean
  maxItems?: number
}

const ClinicFeaturesSection: React.FC<ClinicFeaturesProps> = ({
  title = "차이를 만드는 원셀만의 디테일",
  subtitle = "환자 안전과 만족을 위한 원셀 메디클리닉만의 특별한 시스템",
  showCategories = true,
  maxItems = 8
}) => {
  const [features, setFeatures] = useState<ClinicFeature[]>([])
  const [filteredFeatures, setFilteredFeatures] = useState<ClinicFeature[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState<boolean[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const categories = [
    { key: 'all', label: '전체' },
    { key: 'technology', label: '첨단기술' },
    { key: 'expertise', label: '전문성' },
    { key: 'safety', label: '안전' },
    { key: 'consultation', label: '상담' },
    { key: 'facility', label: '시설' }
  ]

  useEffect(() => {
    fetchFeatures()
  }, [])

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredFeatures(features.slice(0, maxItems))
    } else {
      setFilteredFeatures(features.filter(feature => feature.category === activeCategory).slice(0, maxItems))
    }
  }, [features, activeCategory, maxItems])

  useEffect(() => {
    setVisibleItems(new Array(filteredFeatures.length).fill(false))

    // Setup intersection observer for animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0')
          if (entry.isIntersecting) {
            setVisibleItems(prev => {
              const newState = [...prev]
              newState[index] = true
              return newState
            })
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '-50px'
      }
    )

    // Observe all cards
    cardRefs.current.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [filteredFeatures])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const data = await ContentFeaturesService.getClinicFeatures()
      setFeatures(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching features:', error)
      setError('특징을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardRef = (el: HTMLDivElement | null, index: number) => {
    cardRefs.current[index] = el
  }

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>특징을 불러오는 중...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchFeatures} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {showCategories && (
          <div className={styles.categoryFilter}>
            {categories.map(category => (
              <button
                key={category.key}
                className={`${styles.categoryButton} ${
                  activeCategory === category.key ? styles.active : ''
                }`}
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.featuresGrid}>
          {filteredFeatures.map((feature, index) => (
            <div
              key={feature.id}
              ref={(el) => handleCardRef(el, index)}
              data-index={index}
              className={`${styles.featureCard} ${
                visibleItems[index] ? styles.visible : ''
              }`}
              style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
            >
              <div className={styles.cardInner}>
                <div className={styles.iconContainer}>
                  {feature.icon_url ? (
                    <img src={feature.icon_url} alt="" className={styles.icon} />
                  ) : (
                    <div className={styles.iconPlaceholder}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className={styles.content}>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  {feature.description && (
                    <p className={styles.featureDescription}>{feature.description}</p>
                  )}

                  {(feature.stats_number || feature.stats_label) && (
                    <div className={styles.stats}>
                      {feature.stats_number && (
                        <span className={styles.statsNumber}>{feature.stats_number}</span>
                      )}
                      {feature.stats_label && (
                        <span className={styles.statsLabel}>{feature.stats_label}</span>
                      )}
                    </div>
                  )}
                </div>

                {feature.image_url && (
                  <div className={styles.imageContainer}>
                    <img
                      src={feature.image_url}
                      alt={feature.title}
                      className={styles.featureImage}
                    />
                  </div>
                )}

                <div className={styles.cardOverlay}>
                  <div className={styles.overlayContent}>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFeatures.length === 0 && (
          <div className={styles.noFeatures}>
            <p>선택한 카테고리에 특징이 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default ClinicFeaturesSection