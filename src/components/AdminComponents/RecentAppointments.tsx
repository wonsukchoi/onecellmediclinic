import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminService } from '../../services/admin.service'
import type { Appointment } from '../../types'
import styles from './RecentAppointments.module.css'

export const RecentAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecentAppointments = async () => {
      try {
        const response = await AdminService.getAppointments(
          undefined,
          { page: 1, limit: 5 }
        )

        if (response.success && response.data) {
          setAppointments(response.data)
        }
      } catch (error) {
        console.error('Error fetching recent appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentAppointments()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '대기중', color: 'orange' },
      confirmed: { label: '확정', color: 'green' },
      cancelled: { label: '취소', color: 'red' },
      completed: { label: '완료', color: 'blue' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'gray' }

    return (
      <span className={`${styles.statusBadge} ${styles[config.color]}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  if (loading) {
    return (
      <div className={styles.recentAppointments}>
        <div className={styles.header}>
          <h3>최근 예약</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>예약 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.recentAppointments}>
      <div className={styles.header}>
        <h3>최근 예약</h3>
        <button
          onClick={() => navigate('/admin/bookings')}
          className={styles.viewAllButton}
        >
          모두 보기
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className={styles.emptyState}>
          <p>최근 예약이 없습니다</p>
        </div>
      ) : (
        <div className={styles.appointmentsList}>
          {appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentItem}>
              <div className={styles.appointmentTime}>
                <div className={styles.date}>
                  {formatDate(appointment.preferred_date)}
                </div>
                <div className={styles.time}>
                  {formatTime(appointment.preferred_time)}
                </div>
              </div>

              <div className={styles.appointmentInfo}>
                <div className={styles.patientName}>
                  {appointment.patient_name}
                </div>
                <div className={styles.serviceType}>
                  {appointment.service_type}
                </div>
                <div className={styles.contact}>
                  📞 {appointment.patient_phone}
                </div>
              </div>

              <div className={styles.appointmentStatus}>
                {getStatusBadge(appointment.status)}
              </div>

              <div className={styles.appointmentActions}>
                <button
                  onClick={() => navigate(`/admin/bookings?id=${appointment.id}`)}
                  className={styles.detailButton}
                  title="상세 보기"
                >
                  👁️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <button
          onClick={() => navigate('/admin/bookings?status=pending')}
          className={styles.pendingButton}
        >
          대기 중인 예약 확인
        </button>
      </div>
    </div>
  )
}