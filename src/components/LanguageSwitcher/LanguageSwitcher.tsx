import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n/config';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'toggle';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown'
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language as SupportedLanguage;

  const handleLanguageChange = (language: SupportedLanguage) => {
    i18n.changeLanguage(language);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent, language?: SupportedLanguage) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (language) {
        handleLanguageChange(language);
      } else {
        toggleDropdown();
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getLanguageLabel = (language: SupportedLanguage): string => {
    return t(`language_switcher.${language === 'kr' ? 'korean' : 'english'}`);
  };

  const getLanguageFlag = (language: SupportedLanguage): string => {
    return language === 'kr' ? 'KR' : 'EN';
  };

  if (variant === 'toggle') {
    return (
      <div className={`${styles.languageToggle} ${className}`}>
        {SUPPORTED_LANGUAGES.map((language) => (
          <button
            key={language}
            className={`${styles.toggleButton} ${
              currentLanguage === language ? styles.active : ''
            }`}
            onClick={() => handleLanguageChange(language)}
            onKeyDown={(e) => handleKeyDown(e, language)}
            aria-pressed={currentLanguage === language}
            aria-label={t('language_switcher.change_language')}
          >
            <span className={styles.flag}>{getLanguageFlag(language)}</span>
            <span className={styles.label}>{language.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.languageSwitcher} ${className}`}>
      <button
        className={styles.dropdownTrigger}
        onClick={toggleDropdown}
        onKeyDown={(e) => handleKeyDown(e)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('language_switcher.change_language')}
      >
        <span className={styles.flag}>{getLanguageFlag(currentLanguage)}</span>
        <span className={styles.currentLanguage}>
          {getLanguageLabel(currentLanguage)}
        </span>
        <span
          className={`${styles.dropdownIcon} ${isOpen ? styles.open : ''}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className={styles.dropdownMenu}
          role="listbox"
          aria-label={t('language_switcher.change_language')}
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language}
              className={`${styles.dropdownItem} ${
                currentLanguage === language ? styles.selected : ''
              }`}
              onClick={() => handleLanguageChange(language)}
              onKeyDown={(e) => handleKeyDown(e, language)}
              role="option"
              aria-selected={currentLanguage === language}
            >
              <span className={styles.flag}>{getLanguageFlag(language)}</span>
              <span className={styles.label}>{getLanguageLabel(language)}</span>
              {currentLanguage === language && (
                <span className={styles.checkmark} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;