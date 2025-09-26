import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EnhancedNavigation from '../Navigation/EnhancedNavigation'
import styles from './Header.module.css'

interface HeaderProps {
  transparent?: boolean
}


const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const handleNavigationClose = () => {
    setIsMobileMenuOpen(false)
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

          <div id="nav-menu" className={menuClasses}>
            <EnhancedNavigation
              className={styles.enhancedNav}
              onNavigate={handleNavigationClose}
            />

            <div className={styles.ctaContainer}>
              <Link
                to="/reservation"
                className={styles.btnCta}
                onClick={handleNavigationClose}
              >
                예약문의
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header