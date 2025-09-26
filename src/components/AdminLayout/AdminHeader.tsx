import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../contexts/AdminContext'
import { useRealtimeAdmin } from '../../hooks/useRealtimeAdmin'
import styles from './AdminHeader.module.css'

interface AdminHeaderProps {
  onToggleSidebar: () => void
}

interface Breadcrumb {
  label: string
  path?: string
}

const getBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split('/').filter(Boolean)

  const breadcrumbMap: Record<string, string> = {
    admin: '대시보드',
    bookings: '예약 관리',
    consultations: '상담 요청',
    procedures: '시술 관리',
    providers: '의료진 관리',
    content: '콘텐츠 관리',
    blog: '블로그',
    gallery: '갤러리',
    banners: '이벤트 배너',
    settings: '설정'
  }

  const breadcrumbs: Breadcrumb[] = [
    { label: '홈', path: '/admin' }
  ]

  let currentPath = ''
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    if (breadcrumbMap[segment]) {
      breadcrumbs.push({
        label: breadcrumbMap[segment],
        path: `/admin${currentPath}`
      })
    }
  }

  return breadcrumbs
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const { user, signOut } = useAuth()
  const { stats } = useAdmin()
  const { updates, isConnected } = useRealtimeAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const breadcrumbs = getBreadcrumbs(location.pathname)

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          onClick={onToggleSidebar}
          className={styles.menuButton}
          aria-label="메뉴 토글"
        >
          ≡
        </button>

        <nav className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className={styles.breadcrumbItem}>
              {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
              {crumb.path && index < breadcrumbs.length - 1 ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className={styles.breadcrumbLink}
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className={styles.headerRight}>
        {stats && (
          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>오늘 예약</span>
              <span className={styles.statValue}>{stats.todayAppointments}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>대기 중</span>
              <span className={styles.statValue}>{stats.pendingAppointments}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>새 상담</span>
              <span className={styles.statValue}>{stats.newConsultations}</span>
            </div>
          </div>
        )}

        {/* Real-time Notifications */}
        <div className={styles.notifications}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={styles.notificationButton}
            aria-label="알림"
          >
            🔔
            {updates.totalUpdates > 0 && (
              <span className={styles.notificationBadge}>
                {updates.totalUpdates > 99 ? '99+' : updates.totalUpdates}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <h4>실시간 알림</h4>
                <div className={styles.connectionStatus}>
                  <span className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`}></span>
                  {isConnected ? '연결됨' : '연결 끊김'}
                </div>
              </div>

              <div className={styles.notificationList}>
                {updates.newAppointments.length > 0 && (
                  <div className={styles.notificationGroup}>
                    <h5>새로운 예약 ({updates.newAppointments.length})</h5>
                    {updates.newAppointments.slice(0, 3).map((appointment, index) => (
                      <div key={index} className={styles.notificationItem}>
                        <span className={styles.notificationIcon}>📅</span>
                        <div className={styles.notificationContent}>
                          <strong>{appointment.patient_name}</strong>님이 {appointment.service_type} 예약을 신청했습니다
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {updates.newConsultations.length > 0 && (
                  <div className={styles.notificationGroup}>
                    <h5>새로운 상담 ({updates.newConsultations.length})</h5>
                    {updates.newConsultations.slice(0, 3).map((consultation, index) => (
                      <div key={index} className={styles.notificationItem}>
                        <span className={styles.notificationIcon}>💬</span>
                        <div className={styles.notificationContent}>
                          <strong>{consultation.patient_name}</strong>님이 {consultation.consultation_type} 상담을 요청했습니다
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {updates.totalUpdates === 0 && (
                  <div className={styles.noNotifications}>
                    새로운 알림이 없습니다
                  </div>
                )}
              </div>

              {updates.totalUpdates > 0 && (
                <div className={styles.notificationFooter}>
                  <button
                    onClick={() => navigate('/admin/bookings')}
                    className={styles.viewAllButton}
                  >
                    모든 예약 보기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.userMenu}>
          <button
            onClick={toggleUserMenu}
            className={styles.userButton}
            aria-label="사용자 메뉴"
          >
            <div className={styles.userAvatar}>
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || user?.email}</span>
              <span className={styles.userRole}>관리자</span>
            </div>
            <span className={styles.dropdownIcon}>▼</span>
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.userDetails}>
                  <strong>{user?.name || '관리자'}</strong>
                  <br />
                  <small>{user?.email}</small>
                </div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  navigate('/admin/settings')
                }}
                className={styles.dropdownItem}
              >
                ⚙️ 설정
              </button>
              <button
                onClick={handleSignOut}
                className={styles.dropdownItem}
              >
                🚪 로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {(showUserMenu || showNotifications) && (
        <div
          className={styles.overlay}
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}