import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ConsultationSidebar.module.css'

interface ConsultationOption {
  id: string
  icon: string
  label: string
  description: string
  action: () => void
  highlight?: boolean
  color?: string
}

interface ConsultationSidebarProps {
  position?: 'left' | 'right'
  className?: string
}

const ConsultationSidebar: React.FC<ConsultationSidebarProps> = ({
  position = 'right',
  className
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()

  // Show sidebar after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 300) // Show after scrolling 300px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const consultationOptions: ConsultationOption[] = [
    {
      id: 'phone',
      icon: '📞',
      label: 'Call Now',
      description: '즉시 전화 상담',
      color: '#10b981',
      action: () => {
        window.location.href = 'tel:+82-2-1234-5678'
      }
    },
    {
      id: 'whatsapp',
      icon: '💬',
      label: 'WhatsApp',
      description: '카카오톡 상담',
      color: '#fbbf24',
      action: () => {
        window.open('https://pf.kakao.com/_xmKKBxj', '_blank')
      }
    },
    {
      id: 'booking',
      icon: '📅',
      label: 'Book Online',
      description: '온라인 예약',
      color: '#3b82f6',
      highlight: true,
      action: () => {
        navigate('/reservation')
      }
    },
    {
      id: 'consultation',
      icon: '💻',
      label: 'Free Consult',
      description: '무료 온라인 상담',
      color: '#8b5cf6',
      action: () => {
        navigate('/consultation')
      }
    },
    {
      id: 'email',
      icon: '✉️',
      label: 'Email Us',
      description: '이메일 문의',
      color: '#ef4444',
      action: () => {
        window.location.href = 'mailto:info@onecellmediclinic.com'
      }
    }
  ]

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleOptionClick = (option: ConsultationOption) => {
    option.action()
    setIsExpanded(false)
  }

  const sidebarClasses = [
    styles.consultationSidebar,
    styles[position],
    isVisible ? styles.visible : '',
    isExpanded ? styles.expanded : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={sidebarClasses}>
      {/* Toggle Button */}
      <button
        className={`${styles.toggleButton} ${isExpanded ? styles.active : ''}`}
        onClick={handleToggleExpanded}
        aria-label={isExpanded ? '상담 메뉴 닫기' : '상담 메뉴 열기'}
      >
        <span className={styles.toggleIcon}>
          {isExpanded ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 12H16M12 8V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className={styles.toggleText}>상담</span>
      </button>

      {/* Options Menu */}
      <div className={styles.optionsMenu}>
        <div className={styles.menuHeader}>
          <h3 className={styles.menuTitle}>빠른 상담</h3>
          <p className={styles.menuSubtitle}>원하시는 방법으로 상담받으세요</p>
        </div>

        <ul className={styles.optionsList}>
          {consultationOptions.map((option) => (
            <li key={option.id} className={styles.optionItem}>
              <button
                className={`${styles.optionButton} ${option.highlight ? styles.highlight : ''}`}
                onClick={() => handleOptionClick(option)}
                style={{
                  '--option-color': option.color || 'var(--color-primary)'
                } as React.CSSProperties}
              >
                <div className={styles.optionIcon} style={{ backgroundColor: option.color }}>
                  <span>{option.icon}</span>
                </div>
                <div className={styles.optionContent}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDescription}>{option.description}</span>
                </div>
                {option.highlight && (
                  <span className={styles.highlightBadge}>추천</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.menuFooter}>
          <div className={styles.businessHours}>
            <h4 className={styles.hoursTitle}>진료시간</h4>
            <ul className={styles.hoursList}>
              <li>평일: 10:00 - 19:00</li>
              <li>토요일: 10:00 - 17:00</li>
              <li>일요일: 휴진</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Action Button (when collapsed) */}
      {!isExpanded && (
        <div className={styles.fabContainer}>
          <button
            className={styles.fab}
            onClick={() => navigate('/reservation')}
            aria-label="빠른 예약"
          >
            <span className={styles.fabIcon}>📅</span>
            <span className={styles.fabText}>예약</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ConsultationSidebar