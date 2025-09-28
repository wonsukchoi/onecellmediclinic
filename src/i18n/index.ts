// Main configuration
export { default as i18n } from './config';

// Helper functions
export {
  getLanguageFromPath,
  getPathWithoutLanguage,
  addLanguageToPath,
  isPublicSEOPath,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  type SupportedLanguage
} from './config';

// Components
export { default as LanguageRouter } from '../components/LanguageRouter/LanguageRouter';
export { default as LanguageSwitcher } from '../components/LanguageSwitcher/LanguageSwitcher';

// Hooks
export { default as useLocalizedNavigation } from '../hooks/useLocalizedNavigation';