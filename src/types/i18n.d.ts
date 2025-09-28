// TypeScript declarations for i18next
import 'i18next';

// Import your translation files to get type safety
import krTranslations from '../i18n/locales/kr.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof krTranslations;
    };
  }
}

// Support for dynamic language parameters in components
declare module 'react-i18next' {
  interface Trans {
    i18nKey?: string;
    defaults?: string;
    values?: Record<string, unknown>;
    components?: readonly React.ReactElement[] | Record<string, React.ReactElement>;
    count?: number;
    context?: string;
    ns?: string | readonly string[];
    parent?: string | React.ComponentType<any> | null;
    tOptions?: Record<string, unknown>;
    shouldUnescape?: boolean;
  }
}

export {};