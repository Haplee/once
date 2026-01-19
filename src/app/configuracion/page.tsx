'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
    const { t, language, setLanguage } = useI18n();
    const { theme, setTheme } = useTheme();

    const locales = [
        { code: 'es', label: 'settingsLangSpanish' },
        { code: 'en', label: 'settingsLangEnglish' },
        { code: 'ca', label: 'settingsLangCatalan' },
        { code: 'gl', label: 'settingsLangGalician' },
        { code: 'eu', label: 'settingsLangBasque' },
        { code: 'va', label: 'settingsLangValencian' },
        { code: 'fr', label: 'settingsLangFrench' },
    ];

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h1>{t('settingsTitle')}</h1>

            {/* Theme */}
            <div className="mb-2">
                <h2>{t('settingsDarkModeLabel')}</h2>
                <div className="d-flex align-items-center gap-2" style={{ justifyContent: 'center' }}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            id="theme-toggle"
                            checked={theme === 'dark'}
                            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                        <span className="slider round"></span>
                    </label>
                    <label htmlFor="theme-toggle">{t('settingsDarkModeLabel')}</label>
                </div>
            </div>

            {/* Language */}
            <div className="mb-2">
                <h2>{t('settingsLanguageLabel')}</h2>
                <div className="d-flex flex-wrap gap-2">
                    {locales.map((loc) => (
                        <button
                            key={loc.code}
                            className={`btn ${language === loc.code ? 'btn-primary' : 'btn-icon'}`}
                            style={{ padding: '0.5rem 1rem', borderRadius: '12px', aspectRatio: 'auto' }}
                            onClick={() => setLanguage(loc.code as any)}
                        >
                            {t(loc.label as any)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Machine Model */}
            <div className="mb-2">
                <h2>{t('settingsMachineModelLabel')}</h2>
                <select className="form-input" style={{ maxWidth: '300px', margin: '0 auto', display: 'block' }}>
                    <option value="S">{t('settingsMachineModelS')}</option>
                    <option value="M">{t('settingsMachineModelM')}</option>
                    <option value="MAX">{t('settingsMachineModelMax')}</option>
                </select>
            </div>

            {/* Serial Port */}
            <div className="mb-2">
                <h2>{t('settingsSerialTitle')}</h2>
                <p className="text-muted">{t('settingsSerialDescription')}</p>
                <button className="btn btn-primary" onClick={() => alert('Feature in development')}>
                    {t('settingsSerialConnect')}
                </button>
            </div>
        </div>
    );
}
