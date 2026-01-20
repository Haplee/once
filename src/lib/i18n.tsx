'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '@/data/translations/all.json';
import { Language, TranslationKeys, I18nContextType } from '@/types/i18n';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLangState] = useState<Language>('es');

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (translations as any)[saved]) {
            setLangState(saved);
            document.documentElement.lang = saved;
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLangState(lang);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    };

    const t = (key: TranslationKeys, params?: Record<string, string | number>) => {
        const langData = (translations as any)[language] || (translations as any)['es'];
        let text = langData[key] || key;

        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }

        return text;
    };

    return (
        <I18nContext.Provider value={{ language, t, setLanguage }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used within I18nProvider');
    return context;
}
