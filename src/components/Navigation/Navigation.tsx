import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CMSService } from '../../services/cms.service'
import { Icon, type IconName } from '../icons'
import type { HeaderNavigation, NavCategory, NavItem } from '../../types'
import styles from './Navigation.module.css'

// Icon mapping from CMS icon names to Icon component names
const iconMapping: Record<string, IconName> = {
  'hospital': 'medical',
  'doctor': 'user',
  'building': 'medical',
  'clipboard': 'calendar',
  'sparkles': 'star',
  'star': 'star',
  'woman': 'user',
  'shield': 'check',
  'camera': 'image',
  'video': 'video',
  'play': 'video',
  'selfie': 'selfie',
  'party': 'star',
  'gift': 'star',
  'fire': 'warning',
  'calendar': 'calendar',
  'laptop': 'medical',
  'emergency': 'warning',
  'location': 'medical',
  'phone': 'phone',
  'mail': 'mail',
  'menu': 'menu',
  'search': 'search',
  'plus': 'plus',
  'edit': 'edit',
  'delete': 'delete',
  'view': 'view',
  'close': 'close',
  'chevron-down': 'chevronDown',
  'chevron-right': 'chevronRight',
  'chevron-left': 'chevronLeft',
  'chevron-up': 'chevronUp'
}

// Cache configuration
const NAVIGATION_CACHE_KEY = 'cms_navigation_cache'
const NAVIGATION_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface NavigationCache {
  data: NavCategory[]
  timestamp: number
}

interface NavigationProps {
  className?: string
  onNavigate?: () => void
}

// Fallback navigation for when CMS fails to load
const fallbackNavigation: NavCategory[] = [
  {
    id: 'about',
    title: '병원소개',
    items: [
      {
        label: '원셀 소개',
        path: '/about',
        description: '원셀 메디의원 소개'
      },
      {
        label: '의료진 소개',
        path: '/staff',
        description: '전문 의료진 프로필'
      }
    ]
  },
  {
    id: 'stemcell',
    title: '줄기세포',
    items: [
      {
        label: '줄기세포 소개',
        path: '/procedures/stemcell',
        description: '줄기세포 치료 소개'
      },
      {
        label: '줄기세포 시술',
        path: '/procedures/stemcell-treatment',
        description: '줄기세포 시술 안내'
      }
    ]
  },
  {
    id: 'immune',
    title: '면역치료',
    items: [
      {
        label: '면역치료 소개',
        path: '/procedures/immune',
        description: '면역치료 소개'
      },
      {
        label: '면역치료 시술',
        path: '/procedures/immune-treatment',
        description: '면역치료 시술 안내'
      }
    ]
  },
  {
    id: 'dermatology',
    title: '피부',
    items: [
      {
        label: '피부 시술 소개',
        path: '/procedures/dermatology',
        description: '피부 시술 소개'
      },
      {
        label: '피부 관리',
        path: '/procedures/skin-care',
        description: '피부 관리 프로그램'
      }
    ]
  },
  {
    id: 'plastic',
    title: '성형',
    items: [
      {
        label: '성형 시술 소개',
        path: '/procedures/plastic',
        description: '성형 시술 소개'
      },
      {
        label: '성형 프로그램',
        path: '/procedures/plastic-programs',
        description: '성형 프로그램 안내'
      }
    ]
  },
  {
    id: 'pain',
    title: '통증클리닉',
    items: [
      {
        label: '통증 치료 소개',
        path: '/procedures/pain',
        description: '통증 치료 소개'
      },
      {
        label: '통증 관리',
        path: '/procedures/pain-management',
        description: '통증 관리 프로그램'
      }
    ]
  },
  {
    id: 'booking',
    title: '예약 및 상담',
    featured: false,
    items: [
      {
        label: '온라인 상담',
        path: '/consultation',
        description: '비대면 전문의 상담',
        featured: false
      },
      {
        label: '방문 예약',
        path: '/reservation',
        description: '직접 방문 예약',
        featured: false
      }
    ]
  }
]

// Helper functions
const getCachedNavigation = (): NavigationCache | null => {
  try {
    const cached = localStorage.getItem(NAVIGATION_CACHE_KEY)
    if (!cached) return null

    const cache: NavigationCache = JSON.parse(cached)
    const now = Date.now()

    if (now - cache.timestamp > NAVIGATION_CACHE_DURATION) {
      localStorage.removeItem(NAVIGATION_CACHE_KEY)
      return null
    }

    return cache
  } catch (error) {
    console.error('Error reading navigation cache:', error)
    localStorage.removeItem(NAVIGATION_CACHE_KEY)
    return null
  }
}

const setCachedNavigation = (data: NavCategory[]): void => {
  try {
    const cache: NavigationCache = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(NAVIGATION_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Error caching navigation:', error)
  }
}

const getIconName = (iconName: string | null | undefined): IconName | undefined => {
  if (!iconName) return undefined
  const mappedIcon = iconMapping[iconName.toLowerCase()]
  return mappedIcon as IconName || 'menu'
}

const constructPageUrl = (navItem: HeaderNavigation): string => {
  // If it's a direct URL, use it
  if (navItem.url) return navItem.url

  // If it has a page_id, construct dynamic page URL
  if (navItem.page_id) return `/page/${navItem.page_id}`

  // Default fallback
  return '#'
}

const transformCMSNavigationToCategories = (cmsNavigation: HeaderNavigation[]): NavCategory[] => {
  return cmsNavigation
    .filter(item => item.is_visible)
    .map(parentItem => {
      const children = parentItem.children || []

      // Determine if this should be a mega menu (more than 4 items or specific nav_type)
      const megaMenu = parentItem.nav_type === 'megamenu' || children.length > 4

      // Transform children to NavItems
      const items: NavItem[] = children
        .filter((child: HeaderNavigation) => child.is_visible)
        .map((child: HeaderNavigation) => ({
          label: child.label,
          path: constructPageUrl(child),
          description: '', // CMS doesn't have description field yet
          icon: getIconName(child.icon_name),
          featured: child.css_classes?.includes('featured') || false,
          target_blank: child.target_blank || false,
          page_id: child.page_id || undefined
        }))

      return {
        id: parentItem.id,
        title: parentItem.label,
        items,
        featured: parentItem.css_classes?.includes('featured') || false,
        megaMenu
      }
    })
}

const Navigation: React.FC<NavigationProps> = ({
  className,
  onNavigate
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [navigationCategories, setNavigationCategories] = useState<NavCategory[]>(fallbackNavigation)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { i18n } = useTranslation()

  // Load navigation data from CMS
  useEffect(() => {
    const loadNavigation = async () => {
      try {
        setIsLoading(true)

        // For now, use fallback navigation to ensure our new menu items are shown
        setNavigationCategories(fallbackNavigation)
        setIsLoading(false)
        return;

        // Commented out CMS navigation loading for now to use our custom menu
        /*
        // Check cache first
        const cached = getCachedNavigation()
        if (cached) {
          setNavigationCategories(cached.data)
          setIsLoading(false)
          return
        }

        // Fetch from CMS with current language
        const currentLanguage = i18n.language === 'en' ? 'en' : 'kr'
        const response = await CMSService.getNavigation(currentLanguage)

        if (response.success && response.data) {
          console.log('CMS Navigation Response:', response.data)
          const transformedNavigation = transformCMSNavigationToCategories(response.data)
          console.log('Transformed Navigation:', transformedNavigation)
          setNavigationCategories(transformedNavigation)
          setCachedNavigation(transformedNavigation)
        } else {
          console.error('CMS Navigation Error:', response.error)
          throw new Error(response.error || 'Failed to load navigation')
        }
        */
      } catch (error) {
        console.error('Error loading navigation:', error)
        // Keep fallback navigation on error
        setNavigationCategories(fallbackNavigation)
      } finally {
        setIsLoading(false)
      }
    }

    loadNavigation()
  }, [i18n.language])

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

  const handleNavItemClick = (item: NavItem) => {
    const { path, target_blank } = item

    // Handle anchor links
    if (path.startsWith('#')) {
      const element = document.querySelector(path)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    // Handle external links
    else if (path.startsWith('http://') || path.startsWith('https://')) {
      if (target_blank) {
        window.open(path, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = path
      }
    }
    // Handle internal navigation
    else {
      navigate(path)
    }

    setActiveDropdown(null)
    onNavigate?.()
  }

  const navigationClasses = [
    styles.navigation,
    className
  ].filter(Boolean).join(' ')

  // Show blank during loading - removed loading indicator as requested
  if (isLoading && navigationCategories === fallbackNavigation) {
    return (
      <nav className={navigationClasses}>
        <ul className={styles.navList}>
        </ul>
      </nav>
    )
  }

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
                            onClick={() => handleNavItemClick(item)}
                            data-label={item.label}
                          >
                            {item.icon && (
                              <span className={styles.itemIcon}>
                                <Icon name={item.icon as IconName} size="sm" />
                              </span>
                            )}
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
                  <>
                    {category.id === 'about' && (
                      <div className={styles.categoryTitle}>병원소개</div>
                    )}
                    <ul className={styles.dropdownList}>
                    {category.items.map((item) => (
                      <li key={item.path} className={styles.dropdownItem}>
                        <button
                          className={`${styles.dropdownLink} ${item.featured ? styles.featured : ''}`}
                          onClick={() => handleNavItemClick(item)}
                          data-label={item.label}
                        >
                          {item.icon && (
                            <span className={styles.itemIcon}>
                              <Icon name={item.icon as IconName} size="sm" />
                            </span>
                          )}
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
                  </>
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