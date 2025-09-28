import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import krTranslations from './locales/kr.json';
import enTranslations from './locales/en.json';

const resources = {
  kr: {
    translation: krTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'kr', // Default language is Korean
    fallbackLng: 'kr', // Fallback to Korean
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order matters - localStorage first, then URL path, then fallback
      order: ['localStorage', 'path', 'navigator'],

      // Cache user language preference
      caches: ['localStorage'],

      // Don't cache in cookies for privacy
      excludeCacheFor: ['cimode'],

      // Look for language in URL path (for SEO pages)
      lookupFromPathIndex: 0,

      // Custom path detection for our routing strategy
      lookupLocalStorage: 'i18nextLng',
    },

    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],

    // React i18next options
    react: {
      useSuspense: false, // Disable suspense to avoid SSR issues
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
    },
  });

export default i18n;

// Helper function to get language from URL path
export const getLanguageFromPath = (pathname: string): string | null => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  if (firstSegment === 'kr' || firstSegment === 'en') {
    return firstSegment;
  }

  return null;
};

// Helper function to get path without language prefix
export const getPathWithoutLanguage = (pathname: string): string => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  if (firstSegment === 'kr' || firstSegment === 'en') {
    return '/' + pathSegments.slice(1).join('/');
  }

  return pathname;
};

// Helper function to add language prefix to path
export const addLanguageToPath = (pathname: string, language: string): string => {
  const cleanPath = getPathWithoutLanguage(pathname);

  // For homepage, just return the language prefix
  if (cleanPath === '/' || cleanPath === '') {
    return `/${language}/`;
  }

  return `/${language}${cleanPath}`;
};

// Helper function to check if path is a public SEO page
export const isPublicSEOPath = (pathname: string): boolean => {
  // Remove language prefix for checking
  const cleanPath = getPathWithoutLanguage(pathname);

  // Member and admin pages don't use language prefixes
  if (cleanPath.startsWith('/member') || cleanPath.startsWith('/admin')) {
    return false;
  }

  return true;
};

// Supported languages
export const SUPPORTED_LANGUAGES = ['kr', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Default language
export const DEFAULT_LANGUAGE: SupportedLanguage = 'kr';