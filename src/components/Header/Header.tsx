import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "../Navigation/Navigation";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useMember } from "../../contexts/MemberContext";
import styles from "./Header.module.css";

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const { t } = useTranslation();
  const { member } = useMember();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigationClose = () => {
    setIsMobileMenuOpen(false);
  };

  const headerClasses = [
    styles.siteHeader,
    transparent && !isScrolled && styles.transparent,
    isScrolled && styles.scrolled,
  ]
    .filter(Boolean)
    .join(" ");

  const menuClasses = [styles.navMenu, isMobileMenuOpen && styles.open]
    .filter(Boolean)
    .join(" ");

  const toggleClasses = [styles.navToggle, isMobileMenuOpen && styles.active]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClasses}>
      <div className={styles.headerInner}>
        <Link
          to="/"
          className={styles.logo}
          aria-label={t("header.logo_alt")}
          onClick={() => window.scrollTo(0, 0)}
        >
          <img
            className={styles.logoImg}
            src="/assets/oc-logo.png"
            alt={t("header.logo_alt")}
          />
        </Link>

        <div className={styles.rightSection}>
          <nav className={styles.nav} aria-label="Primary">
            <button
              className={toggleClasses}
              aria-controls="nav-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={t("navigation.menu")}
              onClick={toggleMobileMenu}
            >
              <span></span>
            </button>

            <div id="nav-menu" className={menuClasses}>
              <Navigation
                className={styles.navigation}
                onNavigate={handleNavigationClose}
              />

              <div className={styles.ctaContainer}>
                <Link
                  to="/member/login"
                  className={styles.btnCta}
                  onClick={() => {
                    handleNavigationClose();
                    window.scrollTo(0, 0);
                  }}
                >
                  {t("member.login")} | {t("member.signup")}
                </Link>
              </div>
            </div>
          </nav>

          <LanguageSwitcher
            className={styles.languageSwitcher}
            variant="dropdown"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
