import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ContentFeaturesService } from '../../services/features.service'
import HorizontalScroll from '../../components/HorizontalScroll'
import styles from './SelfieReviewsSection.module.css'

interface SelfieReview {
  id: number
  patient_initial: string
  procedure_type?: string
  selfie_url: string
  review_text?: string
  rating?: number
  patient_age_range?: string
  treatment_date?: string
  recovery_weeks?: number
  verified: boolean
}

interface SelfieReviewsSectionProps {
  title?: string
  subtitle?: string
  showProcedureFilter?: boolean
  maxItems?: number
}

const SelfieReviewsSection: React.FC<SelfieReviewsSectionProps> = ({
  title,
  subtitle,
  showProcedureFilter = true,
  maxItems = 9
}) => {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<SelfieReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<SelfieReview[]>([])
  const [activeProcedure, setActiveProcedure] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<SelfieReview | null>(null)

  const procedures = [
    { key: 'all', label: t('reviews.categories.all') },
    { key: '눈성형', label: t('reviews.categories.eye') },
    { key: '코성형', label: t('reviews.categories.nose') },
    { key: '안면윤곽', label: t('reviews.categories.contouring') },
    { key: '가슴성형', label: t('reviews.categories.breast') },
    { key: '지방흡입', label: t('reviews.categories.liposuction') },
    { key: '주름개선', label: t('reviews.categories.wrinkle') }
  ]

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    if (activeProcedure === 'all') {
      setFilteredReviews(reviews.slice(0, maxItems))
    } else {
      setFilteredReviews(reviews.filter(review => review.procedure_type === activeProcedure).slice(0, maxItems))
    }
  }, [reviews, activeProcedure, maxItems])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await ContentFeaturesService.getSelfieReviews()
      setReviews(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching selfie reviews:', error)
      setError(t('reviews.error.fetchFailed'))
    } finally {
      setLoading(false)
    }
  }

  const openLightbox = (review: SelfieReview) => {
    setLightboxImage(review)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    document.body.style.overflow = 'unset'
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null

    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>{t('reviews.loading')}</p>
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
            <button onClick={fetchReviews} className={styles.retryButton}>
              {t('reviews.error.retry')}
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
          <h2 className={styles.title}>{title || t('reviews.title')}</h2>
          <p className={styles.subtitle}>{subtitle || t('reviews.subtitle')}</p>
        </div>

        {showProcedureFilter && (
          <div className={styles.procedureFilter}>
            {procedures.map(procedure => (
              <button
                key={procedure.key}
                className={`${styles.procedureButton} ${
                  activeProcedure === procedure.key ? styles.active : ''
                }`}
                onClick={() => setActiveProcedure(procedure.key)}
              >
                {procedure.label}
              </button>
            ))}
          </div>
        )}

        <HorizontalScroll
          className={styles.horizontalScrollContainer}
          showIndicators={true}
          itemWidth={320}
          gap={25}
          visibleItems={{
            desktop: 4,
            tablet: 3,
            mobile: 1.5
          }}
          autoScroll={true}
          autoScrollInterval={4000}
          pauseOnHover={true}
          pauseOnInteraction={true}
        >
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={styles.reviewCard}
              onClick={() => openLightbox(review)}
            >
              <div className={styles.imageContainer}>
                <img
                  src={review.selfie_url}
                  alt={t('reviews.imageAlt', { name: review.patient_initial })}
                  className={styles.reviewImage}
                />
                <div className={styles.imageOverlay}>
                  <div className={styles.overlayContent}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    <span>{t('reviews.viewDetails')}</span>
                  </div>
                </div>

                {review.verified && (
                  <div className={styles.verifiedBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 11.08V12a10 10 0 11-5.93-9.14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 4L12 14.01l-3-3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{t('reviews.verified')}</span>
                  </div>
                )}
              </div>

              <div className={styles.reviewInfo}>
                <div className={styles.reviewMeta}>
                  <span className={styles.patientName}>{review.patient_initial}</span>
                  {review.patient_age_range && (
                    <span className={styles.ageRange}>{review.patient_age_range}</span>
                  )}
                </div>

                {review.procedure_type && (
                  <div className={styles.procedureType}>{review.procedure_type}</div>
                )}

                {review.rating && (
                  <div className={styles.rating}>
                    {renderStars(review.rating)}
                  </div>
                )}

                {review.review_text && (
                  <p className={styles.reviewText}>{review.review_text}</p>
                )}

                {review.treatment_date && (
                  <div className={styles.treatmentDate}>
                    {formatDate(review.treatment_date)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </HorizontalScroll>

        {filteredReviews.length === 0 && (
          <div className={styles.noReviews}>
            <p>{t('reviews.noReviews')}</p>
          </div>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <div className={styles.lightbox} onClick={closeLightbox}>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={closeLightbox}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className={styles.lightboxImage}>
                <img
                  src={lightboxImage.selfie_url}
                  alt={t('reviews.imageAlt', { name: lightboxImage.patient_initial })}
                />
              </div>

              <div className={styles.lightboxInfo}>
                <div className={styles.lightboxHeader}>
                  <h3>{t('reviews.patientReview', { name: lightboxImage.patient_initial })}</h3>
                  {lightboxImage.verified && (
                    <div className={styles.verifiedBadge}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M22 11.08V12a10 10 0 11-5.93-9.14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 4L12 14.01l-3-3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{t('reviews.verifiedReview')}</span>
                    </div>
                  )}
                </div>

                {lightboxImage.procedure_type && (
                  <div className={styles.lightboxProcedure}>
                    {t('reviews.procedure')}: {lightboxImage.procedure_type}
                  </div>
                )}

                {lightboxImage.rating && (
                  <div className={styles.lightboxRating}>
                    {renderStars(lightboxImage.rating)}
                  </div>
                )}

                {lightboxImage.review_text && (
                  <p className={styles.lightboxReviewText}>{lightboxImage.review_text}</p>
                )}

                <div className={styles.lightboxMeta}>
                  {lightboxImage.patient_age_range && (
                    <span>{t('reviews.ageRange')}: {lightboxImage.patient_age_range}</span>
                  )}
                  {lightboxImage.treatment_date && (
                    <span>{t('reviews.treatmentDate')}: {formatDate(lightboxImage.treatment_date)}</span>
                  )}
                  {lightboxImage.recovery_weeks && (
                    <span>{t('reviews.recoveryPeriod', { weeks: lightboxImage.recovery_weeks })}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default SelfieReviewsSection