import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { Modal, ConfirmModal } from '../components/AdminComponents/Modal'
import { AdminService } from '../services/admin.service'
import type { Appointment, TableColumn, FilterParams, PaginationParams, SortParams } from '../types'
import styles from './AdminBookingsPage.module.css'

interface BookingCalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  status: string
  patient: string
  service: string
}

export const AdminBookingsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [filters, setFilters] = useState<FilterParams>({})
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, limit: 20 })
  const [sorting, setSorting] = useState<SortParams>({ field: 'created_at', direction: 'desc' })
  const [calendarDate, setCalendarDate] = useState(new Date())

  const columns: TableColumn[] = [
    {
      key: 'patient_name',
      label: '환자명',
      sortable: true,
      render: (value, item) => (
        <div className={styles.patientInfo}>
          <strong>{value}</strong>
          <span className={styles.patientContact}>{item.patient_phone}</span>
        </div>
      )
    },
    {
      key: 'service_type',
      label: '시술/서비스',
      render: (value) => (
        <span className={styles.serviceType}>{value}</span>
      )
    },
    {
      key: 'preferred_date',
      label: '예약일시',
      sortable: true,
      render: (value, item) => (
        <div className={styles.appointmentTime}>
          <div className={styles.date}>{formatDate(value)}</div>
          <div className={styles.time}>{formatTime(item.preferred_time)}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: '상태',
      render: (value) => (
        <span className={`${styles.statusBadge} ${styles[value]}`}>
          {getStatusLabel(value)}
        </span>
      )
    },
    {
      key: 'created_at',
      label: '신청일',
      sortable: true,
      render: (value) => formatDate(value)
    }
  ]

  const statusOptions = [
    { value: 'pending', label: '대기중' },
    { value: 'confirmed', label: '확정' },
    { value: 'cancelled', label: '취소' },
    { value: 'completed', label: '완료' }
  ]

  useEffect(() => {
    fetchAppointments()
  }, [filters, pagination, sorting])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await AdminService.getAppointments(filters, pagination)
      if (response.success && response.data) {
        setAppointments(response.data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '대기중',
      confirmed: '확정',
      cancelled: '취소',
      completed: '완료'
    }
    return statusMap[status] || status
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const handleStatusChange = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setNewStatus(appointment.status)
    setStatusNotes('')
    setShowStatusModal(true)
  }

  const confirmStatusChange = async () => {
    if (!selectedAppointment) return

    try {
      const response = await AdminService.updateAppointmentStatus(
        selectedAppointment.id!,
        newStatus,
        statusNotes
      )

      if (response.success) {
        setShowStatusModal(false)
        setSelectedAppointment(null)
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const getCalendarEvents = (): BookingCalendarEvent[] => {
    return appointments.map(appointment => ({
      id: appointment.id!,
      title: `${appointment.patient_name} - ${appointment.service_type}`,
      start: new Date(`${appointment.preferred_date}T${appointment.preferred_time}`),
      end: new Date(`${appointment.preferred_date}T${appointment.preferred_time}`),
      status: appointment.status,
      patient: appointment.patient_name,
      service: appointment.service_type
    }))
  }

  const renderCalendarView = () => {
    const events = getCalendarEvents()
    const today = new Date()
    const currentMonth = calendarDate.getMonth()
    const currentYear = calendarDate.getFullYear()

    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    const calendarDays = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className={styles.calendarDay}></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day)
      const dayEvents = events.filter(event =>
        event.start.toDateString() === currentDate.toDateString()
      )

      calendarDays.push(
        <div key={day} className={`${styles.calendarDay} ${styles.hasDay}`}>
          <div className={styles.dayNumber}>{day}</div>
          <div className={styles.dayEvents}>
            {dayEvents.map(event => (
              <div
                key={event.id}
                className={`${styles.calendarEvent} ${styles[event.status]}`}
                onClick={() => {
                  const appointment = appointments.find(a => a.id === event.id)
                  if (appointment) handleViewDetails(appointment)
                }}
                title={`${event.patient} - ${event.service}`}
              >
                <span className={styles.eventTime}>
                  {event.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={styles.eventTitle}>{event.patient}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
          <button
            onClick={() => setCalendarDate(new Date(currentYear, currentMonth - 1, 1))}
            className={styles.calendarNav}
          >
            ‹
          </button>
          <h3>
            {currentYear}년 {currentMonth + 1}월
          </h3>
          <button
            onClick={() => setCalendarDate(new Date(currentYear, currentMonth + 1, 1))}
            className={styles.calendarNav}
          >
            ›
          </button>
        </div>

        <div className={styles.calendarGrid}>
          <div className={styles.calendarWeekHeader}>
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className={styles.weekDay}>{day}</div>
            ))}
          </div>
          <div className={styles.calendarDays}>
            {calendarDays}
          </div>
        </div>
      </div>
    )
  }

  const actions = [
    {
      label: '상세보기',
      onClick: (item: Appointment) => handleViewDetails(item),
      variant: 'secondary' as const,
      icon: '👁️'
    },
    {
      label: '상태변경',
      onClick: (item: Appointment) => handleStatusChange(item),
      variant: 'primary' as const,
      icon: '📝'
    }
  ]

  return (
    <div className={styles.bookingsPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>예약 관리</h1>
          <p>고객 예약을 관리하고 상태를 업데이트합니다</p>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={viewMode === 'list' ? styles.active : ''}
            onClick={() => setViewMode('list')}
          >
            📋 목록보기
          </button>
          <button
            className={viewMode === 'calendar' ? styles.active : ''}
            onClick={() => setViewMode('calendar')}
          >
            📅 달력보기
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="환자명 또는 연락처 검색..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">모든 상태</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className={styles.dateInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable
          data={appointments}
          columns={columns}
          loading={loading}
          actions={actions}
          onRowClick={handleViewDetails}
          emptyMessage="예약이 없습니다"
          sorting={{
            sortBy: sorting.field,
            sortDirection: sorting.direction,
            onSort: setSorting
          }}
        />
      ) : (
        renderCalendarView()
      )}

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="예약 상세정보"
        size="md"
      >
        {selectedAppointment && (
          <div className={styles.appointmentDetails}>
            <div className={styles.detailSection}>
              <h4>환자 정보</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label>이름</label>
                  <span>{selectedAppointment.patient_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>이메일</label>
                  <span>{selectedAppointment.patient_email}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>연락처</label>
                  <span>{selectedAppointment.patient_phone}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>예약 정보</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label>시술/서비스</label>
                  <span>{selectedAppointment.service_type}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>예약일</label>
                  <span>{formatDate(selectedAppointment.preferred_date)}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>예약시간</label>
                  <span>{formatTime(selectedAppointment.preferred_time)}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>상태</label>
                  <span className={`${styles.statusBadge} ${styles[selectedAppointment.status]}`}>
                    {getStatusLabel(selectedAppointment.status)}
                  </span>
                </div>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className={styles.detailSection}>
                <h4>특이사항</h4>
                <p className={styles.notes}>{selectedAppointment.notes}</p>
              </div>
            )}

            <div className={styles.detailSection}>
              <h4>신청 정보</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <label>신청일시</label>
                  <span>{formatDate(selectedAppointment.created_at!)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="예약 상태 변경"
        size="sm"
        footer={
          <div className={styles.statusModalFooter}>
            <button
              onClick={() => setShowStatusModal(false)}
              className={styles.cancelButton}
            >
              취소
            </button>
            <button
              onClick={confirmStatusChange}
              className={styles.confirmButton}
            >
              변경
            </button>
          </div>
        }
      >
        <div className={styles.statusChangeForm}>
          <div className={styles.formGroup}>
            <label>새로운 상태</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={styles.statusSelect}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>메모 (선택사항)</label>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="상태 변경에 대한 메모를 입력하세요..."
              className={styles.notesTextarea}
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}