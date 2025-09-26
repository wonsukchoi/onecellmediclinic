import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminService } from '../../services/admin.service'
import type { ConsultationRequest } from '../../types'
import styles from './ConsultationOverview.module.css'

export const ConsultationOverview: React.FC = () => {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await AdminService.getConsultationRequests(
          { status: 'new' },
          { page: 1, limit: 5 }
        )

        if (response.success && response.data) {
          setConsultations(response.data)
        }
      } catch (error) {
        console.error('Error fetching consultations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConsultations()
  }, [])

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      high: { label: '긴급', color: 'red' },
      normal: { label: '일반', color: 'blue' },
      low: { label: '여유', color: 'green' }
    }

    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || { label: urgency, color: 'gray' }

    return (
      <span className={`${styles.urgencyBadge} ${styles[config.color]}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className={styles.consultationOverview}>
        <div className={styles.header}>
          <h3>상담 요청</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>상담 요청을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.consultationOverview}>
      <div className={styles.header}>
        <h3>새로운 상담 요청</h3>
        <button
          onClick={() => navigate('/admin/consultations')}
          className={styles.viewAllButton}
        >
          모두 보기
        </button>
      </div>

      {consultations.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <p>새로운 상담 요청이 없습니다</p>
          <button
            onClick={() => navigate('/admin/consultations')}
            className={styles.emptyButton}
          >
            모든 상담 보기
          </button>
        </div>
      ) : (
        <div className={styles.consultationsList}>
          {consultations.map((consultation) => (
            <div key={consultation.id} className={styles.consultationItem}>
              <div className={styles.consultationHeader}>
                <div className={styles.patientInfo}>
                  <span className={styles.patientName}>
                    {consultation.patient_name}
                  </span>
                  <span className={styles.consultationType}>
                    {consultation.consultation_type}
                  </span>
                </div>
                <div className={styles.consultationMeta}>
                  {getUrgencyBadge(consultation.urgency_level)}
                  <span className={styles.timestamp}>
                    {formatDate(consultation.created_at)}
                  </span>
                </div>
              </div>

              <div className={styles.consultationContent}>
                <div className={styles.procedureInterest}>
                  관심 시술: {consultation.procedure_interest || '미지정'}
                </div>
                <div className={styles.concerns}>
                  {consultation.concerns && consultation.concerns.length > 100
                    ? `${consultation.concerns.substring(0, 100)}...`
                    : consultation.concerns || '상세 내용 없음'
                  }
                </div>
              </div>

              <div className={styles.consultationFooter}>
                <div className={styles.contactInfo}>
                  📧 {consultation.patient_email}
                  {consultation.patient_phone && (
                    <span>📞 {consultation.patient_phone}</span>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/admin/consultations?id=${consultation.id}`)}
                  className={styles.respondButton}
                >
                  응답하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.footerStats}>
          <span>새로운 요청: {consultations.length}건</span>
        </div>
        <button
          onClick={() => navigate('/admin/consultations?status=new')}
          className={styles.manageButton}
        >
          상담 관리
        </button>
      </div>
    </div>
  )
}