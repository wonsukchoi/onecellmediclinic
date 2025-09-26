import React from 'react'
import styles from './StatCard.module.css'

interface TrendData {
  value: number
  isPositive: boolean
}

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: string
  trend?: TrendData
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  size?: 'default' | 'small'
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  size = 'default',
  onClick
}) => {
  const cardClass = `${styles.statCard} ${styles[color]} ${styles[size]} ${onClick ? styles.clickable : ''}`

  return (
    <div className={cardClass} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          {icon && <span className={styles.cardIcon}>{icon}</span>}
          <span>{title}</span>
        </div>
        {trend && (
          <div className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
            <span className={styles.trendIcon}>
              {trend.isPositive ? '↗' : '↘'}
            </span>
            <span className={styles.trendValue}>{trend.value}%</span>
          </div>
        )}
      </div>

      <div className={styles.cardValue}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {subtitle && (
        <div className={styles.cardSubtitle}>
          {subtitle}
        </div>
      )}
    </div>
  )
}