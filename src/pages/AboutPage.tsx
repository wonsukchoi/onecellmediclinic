import React, { useState, useEffect } from 'react'
import { AdminService } from '../services/supabase'
import styles from './AboutPage.module.css'

interface Differentiator {
  id: number
  title: string
  description: string
  icon_name: string
  detailed_info: string
  statistics: any
  display_order: number
  active: boolean
}

interface ClinicFeature {
  id: number
  title: string
  description: string
  icon_name: string
  category: string
  details: string
  image_url: string
  stats: any
  display_order: number
  featured: boolean
  active: boolean
}

const AboutPage: React.FC = () => {
  const [differentiators, setDifferentiators] = useState<Differentiator[]>([])
  const [clinicFeatures, setClinicFeatures] = useState<ClinicFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [diffResponse, featuresResponse] = await Promise.all([
        AdminService.getAll<Differentiator>('differentiators', { sort: { field: 'display_order', direction: 'asc' } }),
        AdminService.getAll<ClinicFeature>('clinic_features', { sort: { field: 'display_order', direction: 'asc' } })
      ])

      if (diffResponse.success && diffResponse.data) {
        setDifferentiators(diffResponse.data.data.filter(d => d.active))
      }

      if (featuresResponse.success && featuresResponse.data) {
        setClinicFeatures(featuresResponse.data.data.filter(f => f.active))
      }
    } catch (err) {
      console.error('Error loading about page data:', err)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>로딩 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={loadData} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              원셀 메디클리닉
              <span className={styles.subtitle}>One Cell Medical Clinic</span>
            </h1>
            <p className={styles.heroDescription}>
              세포 하나부터 전체적인 아름다움까지,<br />
              과학적이고 안전한 의료 서비스로 여러분의 건강한 아름다움을 책임집니다.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>15+</span>
                <span className={styles.statLabel}>년 경력</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>10,000+</span>
                <span className={styles.statLabel}>누적 시술</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>만족도</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.imageCircle}>
              <div className={styles.imageInner}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionGrid}>
            <div className={styles.missionItem}>
              <div className={styles.missionIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>미션</h3>
              <p>
                첨단 의료 기술과 개인 맞춤 치료를 통해<br />
                모든 환자가 건강하고 아름다운 삶을 영위할 수 있도록 돕습니다.
              </p>
            </div>
            <div className={styles.missionItem}>
              <div className={styles.missionIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>비전</h3>
              <p>
                혁신적인 의료 서비스와 지속적인 연구개발을 통해<br />
                국내 최고의 메디컬 클리닉으로 성장합니다.
              </p>
            </div>
            <div className={styles.missionItem}>
              <div className={styles.missionIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61A5.5 5.5 0 0 0 16 2A5.5 5.5 0 0 0 12 4.61A5.5 5.5 0 0 0 8 2A5.5 5.5 0 0 0 3.16 4.61C1.5 6.5 1.5 9.5 12 22C22.5 9.5 22.5 6.5 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>가치</h3>
              <p>
                안전성, 전문성, 신뢰성을 바탕으로<br />
                환자 중심의 의료 서비스를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      {differentiators.length > 0 && (
        <section className={styles.whyChooseSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>원셀을 선택해야 하는 이유</h2>
              <p className={styles.sectionSubtitle}>
                차별화된 의료 서비스와 최고의 전문성으로 여러분의 기대를 뛰어넘겠습니다.
              </p>
            </div>
            <div className={styles.differentiatorGrid}>
              {differentiators.map((diff, index) => (
                <div key={diff.id} className={styles.differentiatorCard} style={{'--delay': `${index * 0.1}s`} as React.CSSProperties}>
                  <div className={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</div>
                  <div className={styles.cardIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className={styles.cardTitle}>{diff.title}</h3>
                  <p className={styles.cardDescription}>{diff.description}</p>
                  {diff.detailed_info && (
                    <div className={styles.cardDetails}>
                      <p>{diff.detailed_info}</p>
                    </div>
                  )}
                  {diff.statistics && (
                    <div className={styles.cardStats}>
                      {Object.entries(diff.statistics).map(([key, value]) => (
                        <div key={key} className={styles.statItem}>
                          <span className={styles.statValue}>{value as string}</span>
                          <span className={styles.statKey}>{key}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Facilities & Features Section */}
      {clinicFeatures.length > 0 && (
        <section className={styles.facilitiesSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>최첨단 시설 및 장비</h2>
              <p className={styles.sectionSubtitle}>
                안전하고 정확한 진료를 위한 첨단 의료 장비와 편안한 진료 환경을 제공합니다.
              </p>
            </div>
            <div className={styles.featuresGrid}>
              {clinicFeatures.map((feature, index) => (
                <div key={feature.id} className={styles.featureCard} style={{'--delay': `${index * 0.15}s`} as React.CSSProperties}>
                  <div className={styles.featureImage}>
                    {feature.image_url ? (
                      <img src={feature.image_url} alt={feature.title} />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                          <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.featureContent}>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDescription}>{feature.description}</p>
                    {feature.details && (
                      <div className={styles.featureDetails}>
                        <p>{feature.details}</p>
                      </div>
                    )}
                    {feature.stats && (
                      <div className={styles.featureStats}>
                        {Object.entries(feature.stats).map(([key, value]) => (
                          <div key={key} className={styles.statPair}>
                            <span className={styles.statLabel}>{key}</span>
                            <span className={styles.statValue}>{value as string}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.featureOverlay}>
                    <div className={styles.overlayContent}>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Commitment Section */}
      <section className={styles.commitmentSection}>
        <div className={styles.container}>
          <div className={styles.commitmentContent}>
            <h2 className={styles.commitmentTitle}>우리의 약속</h2>
            <div className={styles.commitmentGrid}>
              <div className={styles.commitmentItem}>
                <div className={styles.commitmentIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>안전성 보장</h3>
                <p>모든 시술은 철저한 안전 검증을 거쳐 진행됩니다.</p>
              </div>
              <div className={styles.commitmentItem}>
                <div className={styles.commitmentIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M16 4H18A2 2 0 0 1 20 6V18A2 2 0 0 1 18 20H6A2 2 0 0 1 4 18V6A2 2 0 0 1 6 4H8" stroke="currentColor" strokeWidth="2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>개인 맞춤 진료</h3>
                <p>개인의 특성을 고려한 맞춤형 치료 계획을 제공합니다.</p>
              </div>
              <div className={styles.commitmentItem}>
                <div className={styles.commitmentIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22S2 16 2 10C2 5.58172 5.58172 2 10 2C10.81 2 11.58 2.15 12.29 2.41C12.66 2.55 13 2.73 13.29 2.95C14.43 3.77 15.3 4.95 15.71 6.34C15.9 6.89 16 7.44 16 8C16 10.09 14.66 11.86 12.83 12.65C12.58 12.77 12.31 12.85 12.02 12.91C11.68 12.97 11.34 13 11 13H10C8.9 13 8 12.1 8 11V9C8 7.9 8.9 7 10 7H12C13.1 7 14 7.9 14 9V10C14 11.1 13.1 12 12 12S10 11.1 10 10V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="18" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>지속적인 관리</h3>
                <p>시술 후에도 지속적인 사후 관리를 제공합니다.</p>
              </div>
              <div className={styles.commitmentItem}>
                <div className={styles.commitmentIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>최고의 결과</h3>
                <p>최상의 치료 결과를 위해 끊임없이 연구하고 발전합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>원셀 메디클리닉과 함께 시작하세요</h2>
            <p>전문의와의 상담을 통해 여러분에게 맞는 최적의 치료 방법을 찾아보세요.</p>
            <div className={styles.ctaButtons}>
              <a href="/reservation" className={styles.primaryButton}>
                예약하기
              </a>
              <a href="#contact" className={styles.secondaryButton}>
                상담문의
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage