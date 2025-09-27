import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminService } from '../services/supabase'
import type { Procedure, ProcedureCategory } from '../types'
import styles from './ProcedureCategoryPage.module.css'

const ProcedureCategoryPage: React.FC = () => {
  const { category: categorySlug } = useParams<{ category: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<ProcedureCategory | null>(null)
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [allCategories, setAllCategories] = useState<ProcedureCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null)

  useEffect(() => {
    loadData()
  }, [categorySlug])

  const loadData = async () => {
    if (!categorySlug) return

    try {
      setLoading(true)
      setError(null)

      const [categoriesResponse, proceduresResponse] = await Promise.all([
        AdminService.getAll<ProcedureCategory>('procedure_categories', {
          filters: { active: true },
          sort: { field: 'display_order', direction: 'asc' }
        }),
        AdminService.getAll<Procedure>('procedures', {
          filters: { active: true },
          sort: { field: 'display_order', direction: 'asc' }
        })
      ])

      if (categoriesResponse.success && categoriesResponse.data) {
        const categories = categoriesResponse.data.data
        setAllCategories(categories)

        // Find category by name (converting slug back to name)
        const categoryName = decodeURIComponent(categorySlug).replace(/-/g, ' ')
        const foundCategory = categories.find(cat =>
          cat.name.toLowerCase() === categoryName.toLowerCase()
        )

        if (!foundCategory) {
          setError('해당 카테고리를 찾을 수 없습니다.')
          return
        }

        setCategory(foundCategory)

        if (proceduresResponse.success && proceduresResponse.data) {
          const allProcedures = proceduresResponse.data.data
          const categoryProcedures = allProcedures.filter(proc => proc.category_id === foundCategory.id)
          setProcedures(categoryProcedures)
        }
      }
    } catch (err) {
      console.error('Error loading category data:', err)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const sortedProcedures = [...procedures].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortBy) {
      case 'price':
        aValue = a.price_range ? parseFloat(a.price_range.replace(/[^0-9]/g, '')) : 0
        bValue = b.price_range ? parseFloat(b.price_range.replace(/[^0-9]/g, '')) : 0
        break
      case 'duration':
        aValue = a.duration_minutes || 0
        bValue = b.duration_minutes || 0
        break
      default:
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleCategoryChange = (newCategory: ProcedureCategory) => {
    const categorySlug = newCategory.name.toLowerCase().replace(/\s+/g, '-')
    navigate(`/procedures/${encodeURIComponent(categorySlug)}`)
  }

  const handleProcedureClick = (procedure: Procedure) => {
    const categorySlug = category?.name?.toLowerCase().replace(/\s+/g, '-') || ''
    const procedureSlug = procedure.slug || procedure.name.toLowerCase().replace(/\s+/g, '-')
    navigate(`/procedures/${encodeURIComponent(categorySlug)}/${encodeURIComponent(procedureSlug)}`)
  }

  const openProcedureModal = (procedure: Procedure) => {
    setSelectedProcedure(procedure)
    document.body.style.overflow = 'hidden'
  }

  const closeProcedureModal = () => {
    setSelectedProcedure(null)
    document.body.style.overflow = 'auto'
  }

  const formatPrice = (priceRange: string | null | undefined) => {
    if (!priceRange) return '상담 시 안내'
    return priceRange
  }

  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return '상담 시 안내'
    if (minutes < 60) return `${minutes}분`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>시술 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className={styles.error}>
        <h2>오류가 발생했습니다</h2>
        <p>{error || '카테고리를 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate('/procedures')} className={styles.backButton}>
          시술 목록으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className={styles.categoryPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.breadcrumb}>
            <a href="/">홈</a>
            <span>/</span>
            <a href="/procedures">시술</a>
            <span>/</span>
            <span>{category.name}</span>
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{category.name}</h1>
            {category.description && (
              <p className={styles.heroDescription}>{category.description}</p>
            )}
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{procedures.length}</span>
                <span className={styles.statLabel}>시술 종류</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>15+</span>
                <span className={styles.statLabel}>년 경험</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>만족도</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className={styles.categoryNav}>
        <div className={styles.container}>
          <div className={styles.categoryTabs}>
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.categoryTab} ${
                  cat.id === category.id ? styles.active : ''
                }`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat.icon_name && (
                  <span className={styles.categoryIcon}>
                    {cat.icon_name === 'plastic-surgery' && '✨'}
                    {cat.icon_name === 'dermatology' && '🌟'}
                    {cat.icon_name === 'aesthetic' && '💎'}
                    {cat.icon_name === 'face' && '👤'}
                    {cat.icon_name === 'body' && '🏃'}
                    {cat.icon_name === 'skin' && '✨'}
                    {cat.icon_name === 'anti-aging' && '⏰'}
                    {cat.icon_name === 'hair' && '💇'}
                    {cat.icon_name === 'other' && '🔬'}
                  </span>
                )}
                <span className={styles.categoryName}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Procedures Section */}
      <section className={styles.proceduresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerContent}>
              <h2 className={styles.sectionTitle}>{category.name} 시술</h2>
              <p className={styles.sectionSubtitle}>
                전문의가 직접 진행하는 안전하고 효과적인 시술을 만나보세요.
              </p>
            </div>

            <div className={styles.sortControls}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'duration')}
                className={styles.sortSelect}
              >
                <option value="name">이름순</option>
                <option value="price">가격순</option>
                <option value="duration">시간순</option>
              </select>
              <button
                className={styles.sortOrderButton}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {procedures.length === 0 ? (
            <div className={styles.noProcedures}>
              <p>이 카테고리에 등록된 시술이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.proceduresGrid}>
              {sortedProcedures.map((procedure, index) => (
                <div
                  key={procedure.id}
                  className={styles.procedureCard}
                  style={{'--delay': `${index * 0.1}s`} as React.CSSProperties}
                >
                  <div className={styles.cardImage}>
                    {procedure.featured_image_url ? (
                      <img
                        src={procedure.featured_image_url}
                        alt={procedure.name}
                        className={styles.procedureImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <div className={styles.cardOverlay}>
                      <button
                        className={styles.quickViewButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          openProcedureModal(procedure)
                        }}
                      >
                        빠른 보기
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.procedureName}>{procedure.name}</h3>
                    {procedure.description && (
                      <p className={styles.procedureDescription}>{procedure.description}</p>
                    )}

                    <div className={styles.procedureInfo}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>가격</span>
                        <span className={styles.infoValue}>{formatPrice(procedure.price_range)}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>소요시간</span>
                        <span className={styles.infoValue}>{formatDuration(procedure.duration_minutes)}</span>
                      </div>
                      {procedure.recovery_time && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>회복기간</span>
                          <span className={styles.infoValue}>{procedure.recovery_time}</span>
                        </div>
                      )}
                    </div>

                    {procedure.tags && procedure.tags.length > 0 && (
                      <div className={styles.procedureTags}>
                        {procedure.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className={styles.tag}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.cardActions}>
                      <button
                        className={styles.detailButton}
                        onClick={() => handleProcedureClick(procedure)}
                      >
                        자세히 보기
                      </button>
                      <button className={styles.consultButton}>
                        상담 예약
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Procedure Detail Modal */}
      {selectedProcedure && (
        <div className={styles.modal} onClick={closeProcedureModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeProcedureModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.modalImage}>
              {selectedProcedure.featured_image_url ? (
                <img src={selectedProcedure.featured_image_url} alt={selectedProcedure.name} />
              ) : (
                <div className={styles.modalImagePlaceholder}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{selectedProcedure.name}</h2>
                {selectedProcedure.description && (
                  <p className={styles.modalDescription}>{selectedProcedure.description}</p>
                )}
              </div>

              {selectedProcedure.detailed_description && (
                <div className={styles.modalSection}>
                  <h3>시술 상세</h3>
                  <p>{selectedProcedure.detailed_description}</p>
                </div>
              )}

              <div className={styles.modalSection}>
                <h3>시술 정보</h3>
                <div className={styles.modalInfoGrid}>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalInfoLabel}>가격</span>
                    <span className={styles.modalInfoValue}>{formatPrice(selectedProcedure.price_range)}</span>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <span className={styles.modalInfoLabel}>소요시간</span>
                    <span className={styles.modalInfoValue}>{formatDuration(selectedProcedure.duration_minutes)}</span>
                  </div>
                  {selectedProcedure.recovery_time && (
                    <div className={styles.modalInfoItem}>
                      <span className={styles.modalInfoLabel}>회복기간</span>
                      <span className={styles.modalInfoValue}>{selectedProcedure.recovery_time}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedProcedure.preparation_instructions && (
                <div className={styles.modalSection}>
                  <h3>시술 전 준비사항</h3>
                  <p>{selectedProcedure.preparation_instructions}</p>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  className={styles.modalDetailButton}
                  onClick={() => handleProcedureClick(selectedProcedure)}
                >
                  상세 페이지 보기
                </button>
                <button className={styles.modalConsultButton}>
                  상담 예약하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>전문의와 상담받으세요</h2>
            <p>개인의 특성에 맞는 최적의 시술 방법을 찾아보세요.</p>
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

export default ProcedureCategoryPage