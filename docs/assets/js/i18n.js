/**
 * @namespace i18n
 * @description Manages the internationalization of the application's frontend using translations provided by the backend.
 */

/**
 * Gets the translation for a given key from the global translations object.
 * @param {string} key - The translation key.
 * @param {Object.<string, string|number>} [replacements={}] - An object of placeholders to replace.
 * @returns {string} The translated string.
 */
window.t = (key, replacements = {}) => {
    if (!window.translations) {
        console.error('Translations not loaded.');
        return key;
    }
    let translation = window.translations[key] || key;
    for (const placeholder in replacements) {
        translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return translation;
};

/**
 * Sets the application's language by redirecting to a backend endpoint.
 * @param {string} lang - The language code to set (e.g., 'en').
 */
window.setLanguage = (lang) => {
    window.location.href = `/set_language/${lang}`;
};