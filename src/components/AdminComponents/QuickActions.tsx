import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './QuickActions.module.css'

interface QuickAction {
  title: string
  description: string
  icon: string
  path: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const quickActions: QuickAction[] = [
  {
    title: '새 예약 확인',
    description: '대기 중인 예약을 확인하고 승인하세요',
    icon: '📅',
    path: '/admin/bookings?status=pending',
    color: 'blue'
  },
  {
    title: '상담 요청 처리',
    description: '새로운 상담 요청에 응답하세요',
    icon: '💬',
    path: '/admin/consultations?status=new',
    color: 'green'
  },
  {
    title: '시술 관리',
    description: '시술 정보를 추가하거나 수정하세요',
    icon: '⚕️',
    path: '/admin/procedures',
    color: 'purple'
  },
  {
    title: '콘텐츠 작성',
    description: '블로그 포스트나 갤러리를 업데이트하세요',
    icon: '📝',
    path: '/admin/content/blog',
    color: 'orange'
  }
]

export const QuickActions: React.FC = () => {
  const navigate = useNavigate()

  const handleActionClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className={styles.quickActions}>
      <div className={styles.header}>
        <h3>빠른 작업</h3>
        <p>자주 사용하는 기능에 빠르게 접근하세요</p>
      </div>

      <div className={styles.actionsList}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action.path)}
            className={`${styles.actionCard} ${styles[action.color]}`}
          >
            <div className={styles.actionIcon}>
              {action.icon}
            </div>
            <div className={styles.actionContent}>
              <h4 className={styles.actionTitle}>{action.title}</h4>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
            <div className={styles.actionArrow}>
              →
            </div>
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          onClick={() => navigate('/admin/settings')}
          className={styles.settingsButton}
        >
          ⚙️ 시스템 설정
        </button>
      </div>
    </div>
  )
}