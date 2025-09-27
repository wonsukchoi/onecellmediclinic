import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminService } from '../../services/admin.service'
import type { ConsultationRequest } from '../../types'
import styles from './ConsultationOverview.module.css'

interface RetryState {
  attempts: number
  lastAttempt: number
  isRetrying: boolean
}

export const ConsultationOverview: React.FC = () => {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryState, setRetryState] = useState<RetryState>({
    attempts: 0,
    lastAttempt: 0,
    isRetrying: false
  })
  const navigate = useNavigate()
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  const calculateRetryDelay = (attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, attempt), 16000)
  }

  const shouldRetry = (errorMessage: string): boolean => {
    const retryableErrors = [
      'fetch failed',
      'network error',
      'timeout',
      'server error',
      'service unavailable'
    ]
    return retryableErrors.some(err => errorMessage.toLowerCase().includes(err))
  }

  const fetchConsultations = async (isRetry = false) => {
    if (!isMountedRef.current) return

    try {
      if (!isRetry) {
        setLoading(true)
        setError(null)
      }

      const response = await AdminService.getConsultationRequests(
        { status: 'new' },
        { page: 1, limit: 5 }
      )

      if (!isMountedRef.current) return

      if (response.success && response.data) {
        setConsultations(response.data)
        setError(null)
        setRetryState({ attempts: 0, lastAttempt: 0, isRetrying: false })
      } else {
        const errorMessage = response.error || 'Failed to fetch consultation requests'

        // Check if this is a database/table missing error - don't retry these
        if (errorMessage.includes('table') && errorMessage.includes('consultation_requests')) {
          setError('상담 요청 기능이 아직 설정되지 않았습니다. 관리자에게 문의하세요.')
          setRetryState({ attempts: 0, lastAttempt: 0, isRetrying: false })
          return
        }

        // Handle retryable errors
        if (retryState.attempts < 3 && shouldRetry(errorMessage)) {
          const newAttempt = retryState.attempts + 1
          const delay = calculateRetryDelay(newAttempt)

          setRetryState({
            attempts: newAttempt,
            lastAttempt: Date.now(),
            isRetrying: true
          })

          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              fetchConsultations(true)
            }
          }, delay)
        } else {
          setError(`상담 요청을 불러올 수 없습니다: ${errorMessage}`)
          setRetryState(prev => ({ ...prev, isRetrying: false }))
        }
      }
    } catch (error) {
      if (!isMountedRef.current) return

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error fetching consultations:', error)

      // Handle network/fetch errors with retry logic
      if (retryState.attempts < 3 && shouldRetry(errorMessage)) {
        const newAttempt = retryState.attempts + 1
        const delay = calculateRetryDelay(newAttempt)

        setRetryState({
          attempts: newAttempt,
          lastAttempt: Date.now(),
          isRetrying: true
        })

        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchConsultations(true)
          }
        }, delay)
      } else {
        setError(`네트워크 오류: ${errorMessage}`)
        setRetryState(prev => ({ ...prev, isRetrying: false }))
      }
    } finally {
      if (isMountedRef.current && !retryState.isRetrying) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
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
          <p>
            {retryState.isRetrying
              ? `재시도 중... (${retryState.attempts}/3)`
              : '상담 요청을 불러오는 중...'
            }
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.consultationOverview}>
        <div className={styles.header}>
          <h3>상담 요청</h3>
        </div>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <p>{error}</p>
          {retryState.attempts < 3 && (
            <button
              onClick={() => {
                setRetryState({ attempts: 0, lastAttempt: 0, isRetrying: false })
                fetchConsultations()
              }}
              className={styles.retryButton}
            >
              다시 시도
            </button>
          )}
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