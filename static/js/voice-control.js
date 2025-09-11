const VoiceControl = (() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isRecognizing = false;
    let recognitionLang = 'es-ES'; // Default language

    // Maps UI languages to Speech Recognition API languages
    const langMap = {
        es: 'es-ES',
        en: 'en-US',
        pt: 'pt-PT',
        gl: 'gl-ES', // Galician in Spain
        eu: 'eu-ES', // Basque in Spain
        ca: 'ca-ES'  // Catalan in Spain
    };

    function init() {
        if (!isAvailable()) {
            console.warn('Speech Recognition API is not available in this browser.');
            return;
        }
        recognition = new SpeechRecognition();
        recognition.interimResults = false;
        recognition.lang = recognitionLang;

        recognition.onstart = () => {
            isRecognizing = true;
        };

        recognition.onend = () => {
            isRecognizing = false;
        };
    }

    function isAvailable() {
        return !!SpeechRecognition;
    }

    function setLanguageForRecognition(lang) {
        // Use mapped language, or fallback to es-ES if not found
        recognitionLang = langMap[lang] || 'es-ES';
        if (recognition) {
            recognition.lang = recognitionLang;
        }
    }

    function start(callback) {
        if (!isAvailable()) {
            if (callback) callback({ error: 'unsupported' });
            return;
        }
        if (isRecognizing) {
            console.warn('Recognition is already in progress.');
            return;
        }

        // Ensure recognition is initialized
        if (!recognition) {
            init();
        }

        recognition.lang = recognitionLang;

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            if (callback) callback({ transcript, error: null });
            stop(); // Stop after a successful result
        };

        recognition.onerror = (event) => {
            if (callback) callback({ transcript: null, error: event.error });
            stop();
        };

        try {
            recognition.start();
        } catch(e) {
            console.error("Error starting voice recognition:", e);
            if (callback) callback({ transcript: null, error: 'start-failed' });
        }
    }

    function stop() {
        if (isRecognizing) {
            recognition.stop();
        }
    }

    // Initialize on script load
    init();

    return {
        init,
        isAvailable,
        setLanguageForRecognition,
        start,
        stop,
    };
})();
