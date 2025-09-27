import React, { useState, useEffect } from 'react'
import { AdminService } from '../services/supabase'
import type { Provider } from '../types'
import styles from './MedicalStaffPage.module.css'

const MedicalStaffPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await AdminService.getAll<Provider>('providers', {
        filters: { active: true },
        sort: { field: 'years_experience', direction: 'desc' }
      })

      if (response.success && response.data) {
        setProviders(response.data.data)
      } else {
        setError('의료진 정보를 불러오는 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error loading providers:', err)
      setError('의료진 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const openProviderModal = (provider: Provider) => {
    setSelectedProvider(provider)
    document.body.style.overflow = 'hidden'
  }

  const closeProviderModal = () => {
    setSelectedProvider(null)
    document.body.style.overflow = 'auto'
  }

  const formatLanguages = (languages: string[] | null | undefined) => {
    if (!languages || languages.length === 0) return '한국어'
    return languages.join(', ')
  }

  const formatEducation = (education: string[] | null | undefined) => {
    if (!education || education.length === 0) return []
    return education
  }

  const formatCertifications = (certifications: string[] | null | undefined) => {
    if (!certifications || certifications.length === 0) return []
    return certifications
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>의료진 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={loadProviders} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className={styles.staffPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>의료진 소개</h1>
            <p className={styles.heroDescription}>
              풍부한 경험과 전문성을 바탕으로 최고의 의료 서비스를 제공하는<br />
              원셀 메디클리닉의 전문 의료진을 소개합니다.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{providers.length}</span>
                <span className={styles.statLabel}>전문의</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {providers.reduce((avg, p) => avg + (p.years_experience || 0), 0) / providers.length || 0}+
                </span>
                <span className={styles.statLabel}>평균 경력</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>응급 상담</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Staff Grid */}
      <section className={styles.staffSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>전문 의료진</h2>
            <p className={styles.sectionSubtitle}>
              각 분야의 전문가들이 여러분의 건강과 아름다움을 위해 최선을 다하고 있습니다.
            </p>
          </div>

          {providers.length === 0 ? (
            <div className={styles.noProviders}>
              <p>등록된 의료진 정보가 없습니다.</p>
            </div>
          ) : (
            <div className={styles.staffGrid}>
              {providers.map((provider, index) => (
                <div
                  key={provider.id}
                  className={styles.staffCard}
                  style={{'--delay': `${index * 0.1}s`} as React.CSSProperties}
                  onClick={() => openProviderModal(provider)}
                >
                  <div className={styles.cardImage}>
                    {provider.profile_image_url ? (
                      <img
                        src={provider.profile_image_url}
                        alt={provider.full_name}
                        className={styles.profileImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                    <div className={styles.cardOverlay}>
                      <span>자세히 보기</span>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.providerName}>{provider.full_name}</h3>
                      {provider.title && (
                        <span className={styles.providerTitle}>{provider.title}</span>
                      )}
                    </div>

                    {provider.specialization && (
                      <p className={styles.specialization}>{provider.specialization}</p>
                    )}

                    <div className={styles.cardInfo}>
                      {provider.years_experience && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>경력</span>
                          <span className={styles.infoValue}>{provider.years_experience}년</span>
                        </div>
                      )}

                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>언어</span>
                        <span className={styles.infoValue}>{formatLanguages(provider.languages)}</span>
                      </div>

                      {provider.consultation_fee && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>상담료</span>
                          <span className={styles.infoValue}>
                            {provider.consultation_fee.toLocaleString()}원
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button className={styles.viewProfileButton}>
                        프로필 보기
                      </button>
                      <button className={styles.bookingButton}>
                        예약하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div className={styles.modal} onClick={closeProviderModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeProviderModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalImage}>
                {selectedProvider.profile_image_url ? (
                  <img
                    src={selectedProvider.profile_image_url}
                    alt={selectedProvider.full_name}
                  />
                ) : (
                  <div className={styles.modalImagePlaceholder}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className={styles.modalInfo}>
                <h2 className={styles.modalName}>{selectedProvider.full_name}</h2>
                {selectedProvider.title && (
                  <p className={styles.modalTitle}>{selectedProvider.title}</p>
                )}
                {selectedProvider.specialization && (
                  <p className={styles.modalSpecialization}>{selectedProvider.specialization}</p>
                )}

                <div className={styles.modalStats}>
                  {selectedProvider.years_experience && (
                    <div className={styles.modalStat}>
                      <span className={styles.modalStatNumber}>{selectedProvider.years_experience}</span>
                      <span className={styles.modalStatLabel}>년 경력</span>
                    </div>
                  )}
                  {selectedProvider.consultation_fee && (
                    <div className={styles.modalStat}>
                      <span className={styles.modalStatNumber}>
                        {(selectedProvider.consultation_fee / 10000).toFixed(0)}만원
                      </span>
                      <span className={styles.modalStatLabel}>상담료</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalBody}>
              {selectedProvider.bio && (
                <div className={styles.modalSection}>
                  <h3>소개</h3>
                  <p>{selectedProvider.bio}</p>
                </div>
              )}

              {formatEducation(selectedProvider.education).length > 0 && (
                <div className={styles.modalSection}>
                  <h3>학력</h3>
                  <ul className={styles.modalList}>
                    {formatEducation(selectedProvider.education).map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))}
                  </ul>
                </div>
              )}

              {formatCertifications(selectedProvider.certifications).length > 0 && (
                <div className={styles.modalSection}>
                  <h3>자격증 및 인증</h3>
                  <ul className={styles.modalList}>
                    {formatCertifications(selectedProvider.certifications).map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.modalSection}>
                <h3>기본 정보</h3>
                <div className={styles.modalInfoGrid}>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalInfoLabel}>언어</span>
                    <span className={styles.modalInfoValue}>{formatLanguages(selectedProvider.languages)}</span>
                  </div>
                  {selectedProvider.consultation_fee && (
                    <div className={styles.modalInfoItem}>
                      <span className={styles.modalInfoLabel}>상담료</span>
                      <span className={styles.modalInfoValue}>
                        {selectedProvider.consultation_fee.toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalBookingButton}>
                {selectedProvider.full_name} 선생님과 상담 예약
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>전문의와 상담받으세요</h2>
            <p>경험 많은 전문의들이 여러분의 고민을 함께 해결해드립니다.</p>
            <div className={styles.ctaButtons}>
              <a href="/reservation" className={styles.primaryButton}>
                진료 예약하기
              </a>
              <a href="/consultation" className={styles.secondaryButton}>
                온라인 상담
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MedicalStaffPage