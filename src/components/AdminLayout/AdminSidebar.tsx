import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styles from './AdminSidebar.module.css'

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  path: string
  label: string
  icon: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    path: '/admin',
    label: '대시보드',
    icon: '📊'
  },
  {
    path: '/admin/bookings',
    label: '예약 관리',
    icon: '📅'
  },
  {
    path: '/admin/consultations',
    label: '상담 요청',
    icon: '💬'
  },
  {
    path: '/admin/procedures',
    label: '시술 관리',
    icon: '⚕️'
  },
  {
    path: '/admin/providers',
    label: '의료진 관리',
    icon: '👩‍⚕️'
  },
  {
    path: '/admin/content',
    label: '콘텐츠 관리',
    icon: '📝',
    children: [
      { path: '/admin/content/video-shorts', label: '비디오 쇼츠', icon: '🎬' },
      { path: '/admin/content/features', label: '클리닉 특징', icon: '⭐' },
      { path: '/admin/content/events', label: '이벤트', icon: '🎉' },
      { path: '/admin/content/selfie-reviews', label: '셀카 후기', icon: '🤳' },
      { path: '/admin/content/youtube-videos', label: 'YouTube 비디오', icon: '📺' },
      { path: '/admin/content/differentiators', label: '차별화 요소', icon: '🎯' },
      { path: '/admin/content/blog', label: '블로그', icon: '📰' },
      { path: '/admin/content/gallery', label: '갤러리', icon: '🖼️' },
      { path: '/admin/content/banners', label: '배너', icon: '🏷️' }
    ]
  },
  {
    path: '/admin/settings',
    label: '설정',
    icon: '⚙️'
  }
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation()

  const isActiveLink = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = isActiveLink(item.path)
    const hasChildren = item.children && item.children.length > 0

    return (
      <li key={item.path} className={styles.navItem}>
        <NavLink
          to={item.path}
          className={`${styles.navLink} ${isActive ? styles.active : ''} ${level > 0 ? styles.childLink : ''}`}
          end={item.path === '/admin'}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          {!collapsed && (
            <>
              <span className={styles.navLabel}>{item.label}</span>
              {hasChildren && (
                <span className={styles.expandIcon}>
                  {isActive ? '▼' : '▶'}
                </span>
              )}
            </>
          )}
        </NavLink>

        {hasChildren && !collapsed && isActive && (
          <ul className={styles.subNav}>
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          {collapsed ? (
            <span className={styles.logoIcon}>OC</span>
          ) : (
            <span className={styles.logoText}>OneCell Admin</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className={styles.toggleButton}
          aria-label={collapsed ? '사이드바 확장' : '사이드바 축소'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          {navItems.map(item => renderNavItem(item))}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        {!collapsed && (
          <div className={styles.footerContent}>
            <p className={styles.version}>v1.0.0</p>
            <p className={styles.copyright}>© 2024 OneCell</p>
          </div>
        )}
      </div>
    </aside>
  )
}