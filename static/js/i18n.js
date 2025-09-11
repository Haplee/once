const I18N = (() => {
    const en_translations = {
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
        "loginWelcome": "Welcome!",
        "loginPrompt": "Please enter your credentials to continue.",
        "loginForgotPassword": "Forgot your password?",
        "loginNoAccount": "Don't have an account?",
        "loginSignUp": "Sign Up",
        "signupTitle": "Create an Account",
        "signupPrompt": "Enter your details to register.",
        "signupUsernameLabel": "Username",
        "signupPasswordLabel": "Password",
        "signupConfirmPasswordLabel": "Confirm Password",
        "signupButton": "Sign Up",
        "signupHasAccount": "Already have an account?",
        "signupLoginLink": "Log in",
        "signupErrorPasswordsMismatch": "Passwords do not match.",
        "signupErrorUserExists": "Username already exists. Please choose another one.",
        "signupErrorRequired": "Please fill in all fields.",
        "signupSuccess": "Registration successful! You can now log in.",
        "forgotPasswordTitle": "Recover Password",
        "forgotPasswordPrompt": "Enter your username to receive instructions.",
        "forgotPasswordUsernameLabel": "Username",
        "forgotPasswordButton": "Send Instructions",
        "forgotPasswordConfirmation": "If an account with that username exists, password recovery instructions have been sent to the associated email address.",
        "backToLoginLink": "Back to login",
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
        "settingsLangPortuguese": "Portuguese",
        "settingsLangGalician": "Galician",
        "settingsLangBasque": "Basque",
        "settingsLangCatalan": "Catalan",
        "settingsSerialTitle": "External Device Communication",
        "settingsSerialDescription": "Connect a device via USB to send and receive data.",
        "settingsMachineModelLabel": "Machine Model",
        "settingsMachineModelS": "Model S (Basic)",
        "settingsMachineModelM": "Model M (Standard)",
        "settingsMachineModelMax": "Model MAX (Complete)",
        "settingsSerialConnect": "Connect Device",
        "settingsSerialSend": "Send",
        "settingsSerialPlaceholder": "Type a command...",
        "settingsSerialConsoleLabel": "Communication console",
        "logoutButton": "Log Out",
        "reconocimiento_no_disponible": "Voice recognition is not available on this browser."
    };

    const translations = {
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
            "loginWelcome": "¡Bienvenido/a!",
            "loginPrompt": "Por favor, introduce tus credenciales para continuar.",
            "loginForgotPassword": "¿Olvidaste tu contraseña?",
            "loginNoAccount": "¿No tienes una cuenta?",
            "loginSignUp": "Regístrate",
            "signupTitle": "Crear una Cuenta",
            "signupPrompt": "Introduce tus datos para registrarte.",
            "signupUsernameLabel": "Nombre de usuario",
            "signupPasswordLabel": "Contraseña",
            "signupConfirmPasswordLabel": "Confirmar Contraseña",
            "signupButton": "Registrarse",
            "signupHasAccount": "¿Ya tienes una cuenta?",
            "signupLoginLink": "Inicia sesión",
            "signupErrorPasswordsMismatch": "Las contraseñas no coinciden.",
            "signupErrorUserExists": "El nombre de usuario ya existe. Por favor, elige otro.",
            "signupErrorRequired": "Por favor, completa todos los campos.",
            "signupSuccess": "¡Registro completado! Ahora puedes iniciar sesión.",
            "forgotPasswordTitle": "Recuperar Contraseña",
            "forgotPasswordPrompt": "Introduce tu nombre de usuario para recibir instrucciones.",
            "forgotPasswordUsernameLabel": "Nombre de usuario",
            "forgotPasswordButton": "Enviar Instrucciones",
            "forgotPasswordConfirmation": "Si existe una cuenta con ese nombre de usuario, se han enviado las instrucciones para recuperar la contraseña a la dirección de correo asociada.",
            "backToLoginLink": "Volver al inicio de sesión",
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
            "settingsLangPortuguese": "Portugués",
            "settingsLangGalician": "Gallego",
            "settingsLangBasque": "Euskera",
            "settingsLangCatalan": "Catalán",
            "settingsSerialTitle": "Comunicación con Dispositivo Externo",
            "settingsSerialDescription": "Conecta un dispositivo por USB para enviar y recibir datos.",
            "settingsMachineModelLabel": "Modelo de Máquina",
            "settingsMachineModelS": "Modelo S (Básico)",
            "settingsMachineModelM": "Modelo M (Estándar)",
            "settingsMachineModelMax": "Modelo MAX (Completo)",
            "settingsSerialConnect": "Conectar Dispositivo",
            "settingsSerialSend": "Enviar",
            "settingsSerialPlaceholder": "Escribe un comando...",
            "settingsSerialConsoleLabel": "Consola de comunicación",
            "logoutButton": "Cerrar Sesión",
            "reconocimiento_no_disponible": "Reconocimiento de voz no disponible en este navegador."
        },
        "en": en_translations,
        "pt": en_translations,
        "gl": en_translations,
        "eu": en_translations,
        "ca": en_translations
    };

    let currentLang = getSavedLang() || 'es';

    function getSavedLang() {
        return localStorage.getItem('once_lang');
    }

    function saveLang(lang) {
        currentLang = lang;
        localStorage.setItem('once_lang', lang);
    }

    function t(key) {
        return translations[currentLang]?.[key] || translations['es']?.[key] || key;
    }

    function applyToDOM() {
        // Translate text content
        document.querySelectorAll('[data-i18n-key]').forEach(element => {
            const key = element.getAttribute('data-i18n-key');
            element.textContent = t(key) || key;
        });
        // Translate placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder-key]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder-key');
            element.placeholder = t(key) || key;
        });
        // Translate ARIA labels for accessibility
        document.querySelectorAll('[data-i18n-aria-key]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-key');
            element.setAttribute('aria-label', t(key) || key);
        });
        // Translate the page title
        const pageKey = document.body.dataset.pageKey;
        if (pageKey && t(pageKey)) {
            document.title = t(pageKey);
        }
    }

    // Init
    currentLang = getSavedLang() || 'es';

    // Public API
    return {
        translations,
        getSavedLang,
        saveLang,
        t,
        applyToDOM,
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (I18N) {
        I18N.applyToDOM();
    }
});
