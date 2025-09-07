// Objeto global para almacenar las traducciones cargadas.
let translations = {};

// Función para obtener el idioma actual. Revisa localStorage o usa 'es' por defecto.
const getCurrentLanguage = () => {
    return localStorage.getItem('language') || 'es';
};

// Función para cargar el archivo de idioma JSON.
const fetchTranslations = async (lang) => {
    try {
        const response = await fetch(`static/lang/${lang}.json`);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo de idioma: ${lang}.json`);
        }
        translations = await response.json();
    } catch (error) {
        console.error(error);
        // Cargar el idioma por defecto (español) en caso de error.
        const response = await fetch(`static/lang/es.json`);
        translations = await response.json();
    }
};

// Función para traducir la página.
const translatePage = () => {
    // Traducir todos los elementos con 'data-i18n-key'
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        element.textContent = translations[key] || key; // Usar la clave como fallback
    });

    // Traducir los placeholders
    document.querySelectorAll('[data-i18n-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder-key');
        element.placeholder = translations[key] || key;
    });

    // Traducir los aria-labels
    document.querySelectorAll('[data-i18n-aria-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria-key');
        element.setAttribute('aria-label', translations[key] || key);
    });

    // Traducir el título de la página
    const pageKey = document.body.dataset.pageKey;
    if (pageKey && translations[pageKey]) {
        document.title = translations[pageKey];
    }
};

// Función principal que se ejecuta al cargar el script.
const initializeI18n = async () => {
    const lang = getCurrentLanguage();
    await fetchTranslations(lang);
    translatePage();
};

// Añadir data-page-key al body para identificar la página actual y traducir el título.
// Esto se hace aquí para que sea fácil de encontrar.
const identifyPage = () => {
    const path = window.location.pathname.split("/").pop();
    let pageKey = '';
    switch (path) {
        case 'index.html':
            pageKey = 'appTitle';
            break;
        case 'login.html':
            pageKey = 'loginPageTitle';
            break;
        case 'history.html':
            pageKey = 'historyPageTitle';
            break;
        case 'configuracion.html':
            pageKey = 'settingsPageTitle';
            break;
        default:
            // Para cuando se accede a la raíz del sitio
             pageKey = 'appTitle';
    }
    document.body.dataset.pageKey = pageKey;
};

// Ejecutar al cargar el DOM.
document.addEventListener('DOMContentLoaded', () => {
    identifyPage();
    initializeI18n();
});

// Exponer la función para que pueda ser llamada desde otros scripts (ej. al cambiar de idioma).
window.setLanguage = async (lang) => {
    localStorage.setItem('language', lang);
    await initializeI18n();
};
