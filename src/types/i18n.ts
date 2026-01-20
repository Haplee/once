
import translations from '@/data/translations/all.json';

// Define the shape based on the default language (Spanish)
export type TranslationStructure = typeof translations.es;

// Extract valid keys from the default language
export type TranslationKeys = keyof TranslationStructure;

// Define available languages
export type Language = keyof typeof translations;

// Type for the full translations object
export type TranslationData = Record<Language, TranslationStructure>;

// Helper interface for the Context
export interface I18nContextType {
    language: Language;
    t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
    setLanguage: (lang: Language) => void;
}
