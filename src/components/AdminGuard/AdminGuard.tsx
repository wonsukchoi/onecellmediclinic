import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './AdminGuard.module.css'

interface AdminGuardProps {
  children: React.ReactNode
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className={styles.adminLoading}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (user.role !== 'admin') {
    return (
      <div className={styles.adminUnauthorized}>
        <div className={styles.errorContainer}>
          <h2>접근 권한이 없습니다</h2>
          <p>이 페이지에 접근하려면 관리자 권한이 필요합니다.</p>
          <button onClick={() => window.history.back()}>이전 페이지로 돌아가기</button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}