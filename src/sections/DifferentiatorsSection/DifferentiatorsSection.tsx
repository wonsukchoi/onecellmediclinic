import React, { useState, useEffect, useRef } from 'react'
import { ContentFeaturesService } from '../../services/features.service'
import styles from './DifferentiatorsSection.module.css'

interface Differentiator {
  id: number
  title: string
  subtitle?: string
  description?: string
  icon?: string
  icon_url?: string
  stats_number?: string
  stats_label?: string
  background_color: string
  text_color: string
}

interface DifferentiatorsSectionProps {
  title?: string
  subtitle?: string
  maxItems?: number
}

const DifferentiatorsSection: React.FC<DifferentiatorsSectionProps> = ({
  title = "원셀을 선택한 독보적인 이유",
  subtitle = "다른 곳과는 차별화된 원셀 메디클리닉만의 특별함을 확인하세요",
  maxItems = 6
}) => {
  const [differentiators, setDifferentiators] = useState<Differentiator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState<boolean[]>([])
  const [animatedNumbers, setAnimatedNumbers] = useState<{ [key: number]: number }>({})
  const observerRef = useRef<IntersectionObserver | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    fetchDifferentiators()
  }, [])

  useEffect(() => {
    setVisibleItems(new Array(differentiators.length).fill(false))

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

            // Animate numbers
            const differentiator = differentiators[index]
            if (differentiator?.stats_number) {
              animateNumber(differentiator.id, differentiator.stats_number)
            }
          }
        })
      },
      {
        threshold: 0.3,
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
  }, [differentiators])

  const fetchDifferentiators = async () => {
    try {
      setLoading(true)
      const data = await ContentFeaturesService.getDifferentiators()
      setDifferentiators(data.slice(0, maxItems))
      setError(null)
    } catch (error) {
      console.error('Error fetching differentiators:', error)
      setError('차별화 요소를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const animateNumber = (id: number, targetValue: string) => {
    const numericValue = parseInt(targetValue.replace(/[^\d]/g, ''))
    if (isNaN(numericValue)) return

    const duration = 2000
    const steps = 60
    const increment = numericValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        current = numericValue
        clearInterval(timer)
      }
      setAnimatedNumbers(prev => ({ ...prev, [id]: Math.floor(current) }))
    }, duration / steps)
  }

  const getDisplayNumber = (differentiator: Differentiator): string => {
    if (!differentiator.stats_number) return ''

    const animatedValue = animatedNumbers[differentiator.id]
    if (animatedValue !== undefined) {
      // Replace numeric part with animated value
      return differentiator.stats_number.replace(/\d+/, animatedValue.toString())
    }

    return differentiator.stats_number
  }

  const getIconComponent = (iconName?: string) => {
    const iconMap: { [key: string]: React.JSX.Element } = {
      'shield-check': (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      'award': (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="8"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      'user-circle': (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
      'heart': (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      'star': (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      'zap': (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <polygon
            points="13,2 3,14 12,14 11,22 21,10 12,10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }

    return iconMap[iconName || 'star'] || iconMap['star']
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
            <p>차별화 요소를 불러오는 중...</p>
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
            <button onClick={fetchDifferentiators} className={styles.retryButton}>
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

        <div className={styles.differentiatorsGrid}>
          {differentiators.map((differentiator, index) => (
            <div
              key={differentiator.id}
              ref={(el) => handleCardRef(el, index)}
              data-index={index}
              className={`${styles.differentiatorCard} ${
                visibleItems[index] ? styles.visible : ''
              }`}
              style={{
                '--delay': `${index * 0.15}s`,
                '--bg-color': differentiator.background_color,
                '--text-color': differentiator.text_color
              } as React.CSSProperties}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardBackground}></div>

                <div className={styles.iconContainer}>
                  {differentiator.icon_url ? (
                    <img
                      src={differentiator.icon_url}
                      alt=""
                      className={styles.iconImage}
                    />
                  ) : (
                    <div className={styles.iconSvg}>
                      {getIconComponent(differentiator.icon)}
                    </div>
                  )}
                </div>

                <div className={styles.content}>
                  <h3 className={styles.differentiatorTitle}>{differentiator.title}</h3>

                  {differentiator.subtitle && (
                    <p className={styles.differentiatorSubtitle}>{differentiator.subtitle}</p>
                  )}

                  {differentiator.description && (
                    <p className={styles.differentiatorDescription}>{differentiator.description}</p>
                  )}

                  {(differentiator.stats_number || differentiator.stats_label) && (
                    <div className={styles.stats}>
                      {differentiator.stats_number && (
                        <div className={styles.statsNumber}>
                          {getDisplayNumber(differentiator)}
                        </div>
                      )}
                      {differentiator.stats_label && (
                        <div className={styles.statsLabel}>{differentiator.stats_label}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.cardGlow}></div>
              </div>
            </div>
          ))}
        </div>

        {differentiators.length === 0 && (
          <div className={styles.noDifferentiators}>
            <p>차별화 요소가 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default DifferentiatorsSection