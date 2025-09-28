import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  addLanguageToPath,
  isPublicSEOPath,
  type SupportedLanguage
} from '../i18n/config';

/**
 * Hook for handling localized navigation
 * Automatically adds language prefix to public pages when navigating
 */
export const useLocalizedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const navigateLocalized = (path: string, options?: { replace?: boolean }) => {
    const currentLanguage = i18n.language as SupportedLanguage;

    // Check if the target path should have language prefix
    if (isPublicSEOPath(path)) {
      // Add language prefix for public SEO pages
      const localizedPath = addLanguageToPath(path, currentLanguage);
      navigate(localizedPath, options);
    } else {
      // Navigate without language prefix for member/admin pages
      navigate(path, options);
    }
  };

  const getCurrentLanguage = (): SupportedLanguage => {
    return i18n.language as SupportedLanguage;
  };

  const getCurrentPath = (): string => {
    return location.pathname;
  };

  const getLocalizedPath = (path: string): string => {
    const currentLanguage = i18n.language as SupportedLanguage;

    if (isPublicSEOPath(path)) {
      return addLanguageToPath(path, currentLanguage);
    }

    return path;
  };

  return {
    navigate: navigateLocalized,
    getCurrentLanguage,
    getCurrentPath,
    getLocalizedPath,
    isPublicSEOPath
  };
};

export default useLocalizedNavigation;