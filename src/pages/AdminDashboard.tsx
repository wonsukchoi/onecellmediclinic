import React, { useEffect } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import { StatCard } from '../components/AdminComponents/StatCard'
import { ActivityFeed } from '../components/AdminComponents/ActivityFeed'
import { QuickActions } from '../components/AdminComponents/QuickActions'
import { RecentAppointments } from '../components/AdminComponents/RecentAppointments'
import { ConsultationOverview } from '../components/AdminComponents/ConsultationOverview'
import styles from './AdminDashboard.module.css'

export const AdminDashboard: React.FC = () => {
  const { stats, loading, refreshStats } = useAdmin()

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>대시보드 로딩 중...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={styles.errorContainer}>
        <h2>데이터를 불러올 수 없습니다</h2>
        <button onClick={refreshStats} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1>관리자 대시보드</h1>
        <p>OneCell Medi Clinic 운영 현황을 한눈에 확인하세요</p>
        <button onClick={refreshStats} className={styles.refreshButton}>
          🔄 새로고침
        </button>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <StatCard
          title="총 예약"
          value={stats.totalAppointments}
          subtitle="전체 예약 건수"
          icon="📅"
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="대기 중인 예약"
          value={stats.pendingAppointments}
          subtitle="승인 대기 중"
          icon="⏳"
          color="orange"
        />
        <StatCard
          title="오늘 예약"
          value={stats.todayAppointments}
          subtitle="오늘 예약된 건수"
          icon="🗓️"
          color="green"
        />
        <StatCard
          title="새로운 상담"
          value={stats.newConsultations}
          subtitle="미처리 상담 요청"
          icon="💬"
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className={styles.secondaryStats}>
        <StatCard
          title="활성 시술"
          value={stats.activeProcedures}
          subtitle={`총 ${stats.totalProcedures}개 시술`}
          icon="⚕️"
          size="small"
        />
        <StatCard
          title="활성 의료진"
          value={stats.activeProviders}
          subtitle={`총 ${stats.totalProviders}명 등록`}
          icon="👩‍⚕️"
          size="small"
        />
        <StatCard
          title="갤러리 항목"
          value={stats.totalGalleryItems}
          subtitle="Before/After 사진"
          icon="🖼️"
          size="small"
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <RecentAppointments />
          <ConsultationOverview />
        </div>

        <div className={styles.rightColumn}>
          <QuickActions />
          <ActivityFeed activities={stats.recentActivity} />
        </div>
      </div>
    </div>
  )
}