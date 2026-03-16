import { describe, it, expect } from 'vitest';
import translations from '@/data/translations/all.json';

describe('Internacionalización (i18n)', () => {
    const languages = Object.keys(translations);
    const baseLanguage = 'es';
    const baseKeys = Object.keys((translations as any)[baseLanguage]);

    it('todas las lenguas deben tener las mismas claves que la base (es)', () => {
        languages.forEach(lang => {
            const currentKeys = Object.keys((translations as any)[lang]);
            
            // Comprobar que no falten claves
            baseKeys.forEach(key => {
                expect(currentKeys).toContain(key);
            });

            // Comprobar que no sobren claves
            expect(currentKeys.length).toBe(baseKeys.length);
        });
    });

    it('los valores no deben estar vacíos', () => {
        languages.forEach(lang => {
            const langData = (translations as any)[lang];
            baseKeys.forEach(key => {
                expect(langData[key].length).toBeGreaterThan(0);
            });
        });
    });
});
