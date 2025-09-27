import React, { useState, useEffect } from 'react'
import { AdminService } from '../services/supabase'
import type { GalleryItem, Procedure, ProcedureCategory } from '../types'
import styles from './GalleryPage.module.css'

const GalleryPage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [categories, setCategories] = useState<ProcedureCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProcedure, setSelectedProcedure] = useState<string>('all')
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [imageView, setImageView] = useState<'before' | 'after'>('before')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [galleryResponse, proceduresResponse, categoriesResponse] = await Promise.all([
        AdminService.getAll<GalleryItem>('gallery_items', {
          sort: { field: 'display_order', direction: 'asc' }
        }),
        AdminService.getAll<Procedure>('procedures', {
          filters: { active: true },
          sort: { field: 'name', direction: 'asc' }
        }),
        AdminService.getAll<ProcedureCategory>('procedure_categories', {
          filters: { active: true },
          sort: { field: 'display_order', direction: 'asc' }
        })
      ])

      if (galleryResponse.success && galleryResponse.data) {
        setGalleryItems(galleryResponse.data.data.filter(item => item.consent_given))
      }

      if (proceduresResponse.success && proceduresResponse.data) {
        setProcedures(proceduresResponse.data.data)
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data.data)
      }
    } catch (err) {
      console.error('Error loading gallery data:', err)
      setError('갤러리 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = galleryItems.filter(item => {
    if (selectedCategory !== 'all') {
      const procedure = procedures.find(p => p.id === item.procedure_id)
      if (!procedure) return false
      const category = categories.find(c => c.id === procedure.category_id)
      if (!category || category.name !== selectedCategory) return false
    }

    if (selectedProcedure !== 'all') {
      const procedure = procedures.find(p => p.id === item.procedure_id)
      if (!procedure || procedure.name !== selectedProcedure) return false
    }

    return true
  })

  const availableProcedures = selectedCategory === 'all'
    ? procedures
    : procedures.filter(p => {
        const category = categories.find(c => c.id === p.category_id)
        return category && category.name === selectedCategory
      })

  const openLightbox = (item: GalleryItem) => {
    setSelectedImage(item)
    setImageView('before')
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = 'auto'
  }

  const formatPatientInfo = (item: GalleryItem) => {
    const parts = []
    if (item.patient_age_range) parts.push(`${item.patient_age_range}대`)
    if (item.recovery_weeks) parts.push(`회복 ${item.recovery_weeks}주`)
    return parts.join(' • ')
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>갤러리를 불러오는 중...</p>
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
    <div className={styles.galleryPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Before & After 갤러리</h1>
            <p className={styles.heroDescription}>
              실제 환자분들의 시술 전후 사진을 통해<br />
              원셀 메디클리닉의 시술 결과를 확인해보세요.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{galleryItems.length}+</span>
                <span className={styles.statLabel}>시술 사례</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>만족도</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>동의 확보</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className={styles.filterSection}>
        <div className={styles.container}>
          <div className={styles.filterControls}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>카테고리</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setSelectedProcedure('all')
                }}
                className={styles.filterSelect}
              >
                <option value="all">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>시술</label>
              <select
                value={selectedProcedure}
                onChange={(e) => setSelectedProcedure(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">전체 시술</option>
                {availableProcedures.map(procedure => (
                  <option key={procedure.id} value={procedure.name}>
                    {procedure.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterInfo}>
              <span className={styles.resultCount}>
                총 {filteredItems.length}개의 사례
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className={styles.gallerySection}>
        <div className={styles.container}>
          {filteredItems.length === 0 ? (
            <div className={styles.noResults}>
              <p>선택한 조건에 맞는 갤러리 항목이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.galleryGrid}>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={styles.galleryCard}
                  style={{'--delay': `${index * 0.1}s`} as React.CSSProperties}
                  onClick={() => openLightbox(item)}
                >
                  <div className={styles.imageContainer}>
                    <div className={styles.beforeAfter}>
                      <div className={styles.imageWrapper}>
                        <img
                          src={item.before_image_url}
                          alt={`${item.title || '시술'} 전`}
                          className={styles.beforeImage}
                        />
                        <span className={styles.imageLabel}>Before</span>
                      </div>
                      <div className={styles.imageWrapper}>
                        <img
                          src={item.after_image_url}
                          alt={`${item.title || '시술'} 후`}
                          className={styles.afterImage}
                        />
                        <span className={styles.imageLabel}>After</span>
                      </div>
                    </div>
                    <div className={styles.cardOverlay}>
                      <span className={styles.viewIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </span>
                      <span>자세히 보기</span>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>
                      {item.title || procedures.find(p => p.id === item.procedure_id)?.name || '시술 사례'}
                    </h3>
                    {item.description && (
                      <p className={styles.cardDescription}>{item.description}</p>
                    )}
                    <div className={styles.cardInfo}>
                      {formatPatientInfo(item) && (
                        <span className={styles.patientInfo}>{formatPatientInfo(item)}</span>
                      )}
                      {item.featured && (
                        <span className={styles.featuredBadge}>추천</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeLightbox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.lightboxHeader}>
              <h2 className={styles.lightboxTitle}>
                {selectedImage.title || procedures.find(p => p.id === selectedImage.procedure_id)?.name || '시술 사례'}
              </h2>
              <div className={styles.imageToggle}>
                <button
                  className={`${styles.toggleButton} ${imageView === 'before' ? styles.active : ''}`}
                  onClick={() => setImageView('before')}
                >
                  Before
                </button>
                <button
                  className={`${styles.toggleButton} ${imageView === 'after' ? styles.active : ''}`}
                  onClick={() => setImageView('after')}
                >
                  After
                </button>
              </div>
            </div>

            <div className={styles.lightboxImage}>
              <img
                src={imageView === 'before' ? selectedImage.before_image_url : selectedImage.after_image_url}
                alt={`${selectedImage.title || '시술'} ${imageView === 'before' ? '전' : '후'}`}
              />
            </div>

            <div className={styles.lightboxInfo}>
              {selectedImage.description && (
                <p className={styles.lightboxDescription}>{selectedImage.description}</p>
              )}

              <div className={styles.lightboxDetails}>
                {formatPatientInfo(selectedImage) && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>환자 정보</span>
                    <span className={styles.detailValue}>{formatPatientInfo(selectedImage)}</span>
                  </div>
                )}
                {selectedImage.procedure_date && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>시술일</span>
                    <span className={styles.detailValue}>
                      {new Date(selectedImage.procedure_date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}
              </div>

              {selectedImage.patient_testimonial && (
                <div className={styles.testimonial}>
                  <h4>환자 후기</h4>
                  <p>"{selectedImage.patient_testimonial}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <section className={styles.privacySection}>
        <div className={styles.container}>
          <div className={styles.privacyNotice}>
            <h3>개인정보 보호 안내</h3>
            <p>
              모든 사진은 환자분의 동의하에 게시되었으며, 개인 식별이 불가능하도록 처리되었습니다.
              시술 결과는 개인차가 있을 수 있으며, 정확한 상담을 위해 전문의와 직접 상담받으시기 바랍니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>나에게 맞는 시술 찾기</h2>
            <p>전문의와의 1:1 상담을 통해 최적의 시술 방법을 찾아보세요.</p>
            <div className={styles.ctaButtons}>
              <a href="/reservation" className={styles.primaryButton}>
                상담 예약하기
              </a>
              <a href="/procedures" className={styles.secondaryButton}>
                시술 정보 보기
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GalleryPage