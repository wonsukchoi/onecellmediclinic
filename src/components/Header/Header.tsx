import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Header.module.css'
import type { NavigationItem } from '../../types'

interface HeaderProps {
  transparent?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    id: 'about',
    label: '병원소개',
    href: '#about',
    children: [
      { id: 'intro', label: '브라운 소개', href: '#' },
      { id: 'doctors', label: '의료진 소개', href: '#' },
      { id: 'tour', label: '둘러보기', href: '#' },
      { id: 'info', label: '진료안내', href: '#' }
    ]
  },
  {
    id: 'services',
    label: '진료과목',
    href: '#services',
    children: [
      { id: 'plastic-events', label: '성형 이벤트 바로가기', href: '#' },
      { id: 'skin-events', label: '피부 이벤트 바로가기', href: '#' }
    ]
  },
  { id: 'shorts', label: '원셀숏츠', href: '#shorts' },
  { id: 'events', label: '이벤트', href: '#events' },
  { id: 'reviews', label: '셀카후기', href: '#reviews' },
  { id: 'youtube', label: 'YOUTUBE', href: '#youtube' },
  { id: 'contact', label: '오시는길', href: '#contact' }
]

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleDropdown = (itemId: string) => {
    setOpenDropdowns(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsMobileMenuOpen(false)
    setOpenDropdowns([])
  }

  const headerClasses = [
    styles.siteHeader,
    transparent && !isScrolled && styles.transparent,
    isScrolled && styles.scrolled
  ].filter(Boolean).join(' ')

  const menuClasses = [
    styles.navMenu,
    isMobileMenuOpen && styles.open
  ].filter(Boolean).join(' ')

  const toggleClasses = [
    styles.navToggle,
    isMobileMenuOpen && styles.active
  ].filter(Boolean).join(' ')

  return (
    <header className={headerClasses}>
      <div className={styles.headerInner}>
        <Link to="/" className={styles.logo} aria-label="OneCell Medi Clinic">
          <img
            className={styles.logoImg}
            src="/assets/oc-logo.png"
            alt="One Cell Medi Clinic"
          />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <button
            className={toggleClasses}
            aria-controls="nav-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label="메뉴"
            onClick={toggleMobileMenu}
          >
            <span></span>
          </button>

          <ul id="nav-menu" className={menuClasses}>
            {navigationItems.map(item => (
              <li
                key={item.id}
                className={`${styles.navItem} ${item.children ? styles.dropdownItem : ''} ${
                  openDropdowns.includes(item.id) ? styles.open : ''
                }`}
              >
                <a
                  href={item.href}
                  className={styles.navLink}
                  onClick={(e) => {
                    if (item.children) {
                      e.preventDefault()
                      toggleDropdown(item.id)
                    } else {
                      handleLinkClick(item.href)
                    }
                  }}
                >
                  {item.label}
                </a>

                {item.children && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownContent}>
                      <div className={styles.dropdownSection}>
                        <h3 className={styles.dropdownTitle}>{item.label}</h3>
                        <ul className={styles.dropdownList}>
                          {item.children.map(child => (
                            <li key={child.id}>
                              <a
                                href={child.href}
                                className={styles.dropdownLink}
                                onClick={() => handleLinkClick(child.href)}
                              >
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
            <li className={styles.navItem}>
              <Link
                to="/reservation"
                className={styles.btnCta}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                예약문의
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header