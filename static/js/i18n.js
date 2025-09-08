const allTranslations = {
    "es": {
        "appTitle": "Calculadora de Cambio - ONCE App",
        "loginPageTitle": "Iniciar Sesión - ONCE App",
        "historyPageTitle": "Historial de Operaciones - ONCE App",
        "settingsPageTitle": "Configuración - ONCE App",
        "navCalculator": "Calculadora",
        "navHistory": "Historial",
        "navSettings": "Configuración",
        "loginTitle": "Iniciar Sesión",
        "loginUsernameLabel": "Usuario",
        "loginPasswordLabel": "Contraseña",
        "loginButton": "Entrar",
        "loginErrorIncorrect": "Usuario o contraseña incorrectos.",
        "loginErrorUnexpected": "Ha ocurrido un error inesperado. Por favor, inténtalo más tarde.",
        "calculatorTitle": "Calculadora de Cambio",
        "totalToPayLabel": "Total a Pagar (€)",
        "totalToPayPlaceholder": "Ej: 5.50",
        "amountReceivedLabel": "Importe Recibido (€)",
        "amountReceivedPlaceholder": "Ej: 10.00",
        "calculateButton": "Calcular",
        "voiceInputButtonLabel": "Usar entrada de voz",
        "voiceErrorPermission": "Acceso al micrófono denegado. Para usar esta función, por favor, permite el acceso al micrófono en tu navegador.",
        "voiceErrorNoSpeech": "No se ha detectado ninguna voz. Inténtalo de nuevo hablando cerca del micrófono.",
        "voiceErrorInfo": "Error de reconocimiento: {error}. Por favor, inténtalo de nuevo.",
        "voiceErrorTimeout": "El reconocimiento de voz se detuvo por inactividad.",
        "voiceErrorStart": "No se pudo iniciar el reconocimiento. Asegúrate de que el micrófono esté permitido y no esté en uso.",
        "voiceErrorUnsupported": "Lo sentimos, tu navegador no es compatible con el reconocimiento de voz.",
        "changeResultText": "El cambio a devolver es: {change} €",
        "invalidInputText": "Por favor, introduce importes válidos.",
        "amountReceivedLowText": "El importe recibido es menor que el total a pagar.",
        "historyTitle": "Historial de Operaciones",
        "historyHeaderDate": "Fecha y Hora",
        "historyHeaderTotal": "Total Pagado",
        "historyHeaderReceived": "Importe Recibido",
        "historyHeaderChange": "Cambio Devuelto",
        "settingsTitle": "Configuración",
        "settingsDarkModeLabel": "Modo Oscuro",
        "settingsLanguageLabel": "Idioma",
        "settingsLangSpanish": "Español",
        "settingsLangEnglish": "Inglés",
        "logoutButton": "Cerrar Sesión"
    },
    "en": {
        "appTitle": "Change Calculator - ONCE App",
        "loginPageTitle": "Login - ONCE App",
        "historyPageTitle": "Transaction History - ONCE App",
        "settingsPageTitle": "Settings - ONCE App",
        "navCalculator": "Calculator",
        "navHistory": "History",
        "navSettings": "Settings",
        "loginTitle": "Login",
        "loginUsernameLabel": "Username",
        "loginPasswordLabel": "Password",
        "loginButton": "Sign In",
        "loginErrorIncorrect": "Incorrect username or password.",
        "loginErrorUnexpected": "An unexpected error occurred. Please try again later.",
        "calculatorTitle": "Change Calculator",
        "totalToPayLabel": "Total to Pay (€)",
        "totalToPayPlaceholder": "e.g., 5.50",
        "amountReceivedLabel": "Amount Received (€)",
        "amountReceivedPlaceholder": "e.g., 10.00",
        "calculateButton": "Calculate",
        "voiceInputButtonLabel": "Use voice input",
        "voiceErrorPermission": "Microphone access denied. To use this feature, please allow microphone access in your browser.",
        "voiceErrorNoSpeech": "No speech was detected. Try again, speaking clearly near the microphone.",
        "voiceErrorInfo": "Recognition error: {error}. Please try again.",
        "voiceErrorTimeout": "Voice recognition timed out due to inactivity.",
        "voiceErrorStart": "Could not start recognition. Make sure the microphone is allowed and not in use.",
        "voiceErrorUnsupported": "Sorry, your browser does not support voice recognition.",
        "changeResultText": "The change to return is: {change} €",
        "invalidInputText": "Please enter valid amounts.",
        "amountReceivedLowText": "The amount received is less than the total to pay.",
        "historyTitle": "Transaction History",
        "historyHeaderDate": "Date and Time",
        "historyHeaderTotal": "Total Paid",
        "historyHeaderReceived": "Amount Received",
        "historyHeaderChange": "Change Returned",
        "settingsTitle": "Settings",
        "settingsDarkModeLabel": "Dark Mode",
        "settingsLanguageLabel": "Language",
        "settingsLangSpanish": "Spanish",
        "settingsLangEnglish": "English",
        "logoutButton": "Log Out"
    }
};

let currentTranslations = {};

const getCurrentLanguage = () => {
    return localStorage.getItem('language') || 'es';
};

// Carga las traducciones desde el objeto global en lugar de un archivo.
const loadTranslations = (lang) => {
    currentTranslations = allTranslations[lang] || allTranslations['es'];
};

const translatePage = () => {
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        element.textContent = currentTranslations[key] || key;
    });
    document.querySelectorAll('[data-i18n-placeholder-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder-key');
        element.placeholder = currentTranslations[key] || key;
    });
    document.querySelectorAll('[data-i18n-aria-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria-key');
        element.setAttribute('aria-label', currentTranslations[key] || key);
    });
    const pageKey = document.body.dataset.pageKey;
    if (pageKey && currentTranslations[pageKey]) {
        document.title = currentTranslations[pageKey];
    }
};

const initializeI18n = () => {
    const lang = getCurrentLanguage();
    loadTranslations(lang);
    translatePage();
};

const identifyPage = () => {
    const path = window.location.pathname.split("/").pop();
    let pageKey = '';
    if (path.includes('index.html') || path === '') {
        pageKey = 'appTitle';
    } else if (path.includes('login.html')) {
        pageKey = 'loginPageTitle';
    } else if (path.includes('history.html')) {
        pageKey = 'historyPageTitle';
    } else if (path.includes('configuracion.html')) {
        pageKey = 'settingsPageTitle';
    }
    document.body.dataset.pageKey = pageKey;
};

document.addEventListener('DOMContentLoaded', () => {
    identifyPage();
    initializeI18n();
});

window.setLanguage = async (lang) => {
    localStorage.setItem('language', lang);
    initializeI18n();
};
