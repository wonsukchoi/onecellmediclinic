import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getLanguageFromPath,
  getPathWithoutLanguage,
  addLanguageToPath,
  isPublicSEOPath,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage
} from '../../i18n/config';

interface LanguageRouterProps {
  children: React.ReactNode;
}

const LanguageRouter: React.FC<LanguageRouterProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const languageFromPath = getLanguageFromPath(currentPath);

    // Only handle public SEO pages
    if (!isPublicSEOPath(currentPath)) {
      // For member/admin pages, use stored language preference without URL modification
      const storedLanguage = localStorage.getItem('i18nextLng');
      if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage as SupportedLanguage)) {
        i18n.changeLanguage(storedLanguage);
      }
      return;
    }

    // Handle public SEO pages with language routing
    if (languageFromPath) {
      // Valid language in URL, update i18n if needed
      if (i18n.language !== languageFromPath) {
        i18n.changeLanguage(languageFromPath);
      }
    } else {
      // No language in URL for public page
      const storedLanguage = localStorage.getItem('i18nextLng') as SupportedLanguage;
      const targetLanguage = (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage))
        ? storedLanguage
        : DEFAULT_LANGUAGE;

      // Redirect to language-prefixed URL
      const newPath = addLanguageToPath(currentPath, targetLanguage);
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, i18n, navigate]);

  // Handle language changes from language switcher
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const currentPath = location.pathname;

      if (isPublicSEOPath(currentPath)) {
        // For public pages, update URL with new language
        const pathWithoutLanguage = getPathWithoutLanguage(currentPath);
        const newPath = addLanguageToPath(pathWithoutLanguage, lng);

        if (newPath !== currentPath) {
          navigate(newPath, { replace: true });
        }
      }
      // For member/admin pages, language change is handled by localStorage only
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [location.pathname, navigate, i18n]);

  return <>{children}</>;
};

export default LanguageRouter;