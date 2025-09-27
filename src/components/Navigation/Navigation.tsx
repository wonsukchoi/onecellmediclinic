import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Navigation.module.css'

interface NavItem {
  label: string
  path: string
  description?: string
  icon?: string
  featured?: boolean
}

interface NavCategory {
  id: string
  title: string
  items: NavItem[]
  featured?: boolean
  megaMenu?: boolean
}

interface NavigationProps {
  className?: string
  onNavigate?: () => void
}

const navigationCategories: NavCategory[] = [
  {
    id: 'about',
    title: '병원소개',
    items: [
      {
        label: '원셀 소개',
        path: '#about',
        description: '원셀 메디의원 소개',
        icon: '🏥'
      },
      {
        label: '의료진 소개',
        path: '#doctors',
        description: '전문 의료진 프로필',
        icon: '👨‍⚕️'
      },
      {
        label: '시설 둘러보기',
        path: '#tour',
        description: '최신 의료 시설 안내',
        icon: '🏢'
      },
      {
        label: '진료안내',
        path: '#info',
        description: '진료시간 및 예약 안내',
        icon: '📋'
      }
    ]
  },
  {
    id: 'services',
    title: '진료과목',
    megaMenu: true,
    items: [
      {
        label: '성형외과',
        path: '/services/plastic-surgery',
        description: '전문 성형외과 진료',
        icon: '✨'
      },
      {
        label: '피부과',
        path: '/services/dermatology',
        description: '피부 질환 및 미용 치료',
        icon: '🌟'
      },
      {
        label: '미용의학과',
        path: '/services/aesthetic',
        description: '비수술 미용 치료',
        icon: '💆‍♀️'
      },
      {
        label: '예방의학과',
        path: '/services/preventive',
        description: '건강 검진 및 예방',
        icon: '🛡️'
      },
      {
        label: '성형 이벤트',
        path: '#plastic-events',
        description: '특별 할인 이벤트',
        icon: '🎉',
        featured: true
      },
      {
        label: '피부 이벤트',
        path: '#skin-events',
        description: '피부 치료 프로모션',
        icon: '💝',
        featured: true
      }
    ]
  },
  {
    id: 'content',
    title: '콘텐츠',
    items: [
      {
        label: '원셀숏츠',
        path: '#shorts',
        description: '짧은 영상으로 보는 시술 과정',
        icon: '📹'
      },
      {
        label: 'YOUTUBE',
        path: '#youtube',
        description: '유튜브 채널',
        icon: '▶️'
      },
      {
        label: '셀카후기',
        path: '#reviews',
        description: '실제 고객 후기',
        icon: '📸'
      }
    ]
  },
  {
    id: 'events',
    title: '이벤트',
    items: [
      {
        label: '이벤트 갤러리',
        path: '/events',
        description: '모든 이벤트 및 프로모션 보기',
        icon: '🎊'
      },
      {
        label: '진행중 이벤트',
        path: '/events?status=active',
        description: '현재 진행 중인 특별 이벤트',
        icon: '🔥'
      },
      {
        label: '추천 이벤트',
        path: '/events?status=featured',
        description: '추천하는 인기 이벤트',
        icon: '⭐'
      }
    ]
  },
  {
    id: 'booking',
    title: '예약 및 상담',
    featured: true,
    items: [
      {
        label: '온라인 상담',
        path: '/booking/consultation',
        description: '비대면 전문의 상담',
        icon: '💻',
        featured: true
      },
      {
        label: '방문 예약',
        path: '/reservation',
        description: '직접 방문 예약',
        icon: '📅',
        featured: true
      },
      {
        label: '응급 상담',
        path: '/booking/emergency',
        description: '응급 상황 즉시 상담',
        icon: '🚨'
      },
      {
        label: '오시는길',
        path: '#contact',
        description: '병원 위치 및 교통편',
        icon: '📍'
      }
    ]
  }
]

const Navigation: React.FC<NavigationProps> = ({
  className,
  onNavigate
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMouseEnter = (categoryId: string) => {
    if (!isMobile) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setActiveDropdown(categoryId)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setActiveDropdown(null)
      }, 150)
    }
  }

  const handleClick = (categoryId: string) => {
    if (isMobile) {
      setActiveDropdown(activeDropdown === categoryId ? null : categoryId)
    }
  }

  const handleNavItemClick = (path: string) => {
    if (path.startsWith('#')) {
      const element = document.querySelector(path)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(path)
    }

    setActiveDropdown(null)
    onNavigate?.()
  }

  const navigationClasses = [
    styles.navigation,
    className
  ].filter(Boolean).join(' ')

  return (
    <nav className={navigationClasses}>
      <ul className={styles.navList}>
        {navigationCategories.map((category) => (
          <li
            key={category.id}
            className={`${styles.navItem} ${category.featured ? styles.featured : ''}`}
            onMouseEnter={() => handleMouseEnter(category.id)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`${styles.navButton} ${activeDropdown === category.id ? styles.active : ''}`}
              onClick={() => handleClick(category.id)}
              aria-expanded={activeDropdown === category.id}
              aria-haspopup="true"
            >
              {category.title}
              <span className={styles.chevron}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4.5L6 8.5L10 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <div
              className={`${styles.dropdown} ${
                category.megaMenu ? styles.megaMenu : ''
              } ${
                activeDropdown === category.id ? styles.open : ''
              }`}
            >
              <div className={styles.dropdownContent}>
                {category.megaMenu ? (
                  <div className={styles.megaMenuGrid}>
                    <div className={styles.megaMenuSection}>
                      <h4 className={styles.megaMenuTitle}>{category.title}</h4>
                      <div className={styles.megaMenuItems}>
                        {category.items.map((item) => (
                          <button
                            key={item.path}
                            className={`${styles.megaMenuItem} ${item.featured ? styles.featured : ''}`}
                            onClick={() => handleNavItemClick(item.path)}
                          >
                            {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                            <div className={styles.itemContent}>
                              <span className={styles.itemLabel}>{item.label}</span>
                              {item.description && (
                                <span className={styles.itemDescription}>{item.description}</span>
                              )}
                            </div>
                            {item.featured && (
                              <span className={styles.featuredBadge}>NEW</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ul className={styles.dropdownList}>
                    {category.items.map((item) => (
                      <li key={item.path} className={styles.dropdownItem}>
                        <button
                          className={`${styles.dropdownLink} ${item.featured ? styles.featured : ''}`}
                          onClick={() => handleNavItemClick(item.path)}
                        >
                          {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                          <div className={styles.itemContent}>
                            <span className={styles.itemLabel}>{item.label}</span>
                            {item.description && (
                              <span className={styles.itemDescription}>{item.description}</span>
                            )}
                          </div>
                          {item.featured && (
                            <span className={styles.featuredBadge}>HOT</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation