import React from 'react'
import type { ActivityLog } from '../../types'
import styles from './ActivityFeed.module.css'

interface ActivityFeedProps {
  activities: ActivityLog[]
}

const getActivityIcon = (type: string, action: string): string => {
  switch (type) {
    case 'appointment':
      return action.includes('created') ? '📅' : action.includes('confirmed') ? '✅' : '📝'
    case 'consultation':
      return '💬'
    case 'content':
      return '📝'
    case 'user':
      return '👤'
    default:
      return '📋'
  }
}

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
  return `${Math.floor(diffInMinutes / 1440)}일 전`
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className={styles.activityFeed}>
        <div className={styles.header}>
          <h3>최근 활동</h3>
        </div>
        <div className={styles.emptyState}>
          <p>최근 활동이 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.activityFeed}>
      <div className={styles.header}>
        <h3>최근 활동</h3>
        <span className={styles.count}>{activities.length}개</span>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>
              {getActivityIcon(activity.type, activity.action)}
            </div>

            <div className={styles.activityContent}>
              <div className={styles.activityDescription}>
                {activity.description}
              </div>
              <div className={styles.activityMeta}>
                {activity.user_name && (
                  <span className={styles.userName}>{activity.user_name}</span>
                )}
                <span className={styles.timestamp}>
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>

            <div className={styles.activityType}>
              <span className={`${styles.typeTag} ${styles[activity.type]}`}>
                {activity.type === 'appointment' && '예약'}
                {activity.type === 'consultation' && '상담'}
                {activity.type === 'content' && '콘텐츠'}
                {activity.type === 'user' && '사용자'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllButton}>
          모든 활동 보기
        </button>
      </div>
    </div>
  )
}