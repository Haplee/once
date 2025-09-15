document.addEventListener('DOMContentLoaded', () => {
    let voices = [];

    const populateVoiceList = () => {
        voices = window.speechSynthesis.getVoices();
    };

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    /**
     * Applies the selected theme (light/dark) to the application.
     * It reads the theme from localStorage, applies it to the body, and updates
     * the theme toggle switch. It specifically avoids theming the configuration page.
     */
    const applyTheme = () => {
        let theme = localStorage.getItem('theme');
        if (!theme) {
            theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode';
            localStorage.setItem('theme', theme);
        }

        // Apply the theme to the body.
        if (theme === 'dark-mode') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Update the toggle state on the config page if it exists.
        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton) {
            themeToggleButton.checked = theme === 'dark-mode';
        }
    };

    // Apply theme on initial load
    applyTheme();

    // Add event listener for the toggle on the config page
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark-mode' : 'light-mode';
            localStorage.setItem('theme', newTheme);
            // Re-apply theme to respect the "don't theme config page" rule
            applyTheme();
        });
    }

    /**
     * Handles the main calculator form submission.
     * It calculates the change, displays it, speaks it, and saves it to history.
     */
    const form = document.getElementById('change-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const totalAmount = parseFloat(document.getElementById('total-amount').value);
            const amountReceived = parseFloat(document.getElementById('amount-received').value);
            const resultDiv = document.getElementById('result');
            const resultSpinner = document.getElementById('result-spinner');
            const calculateBtn = document.getElementById('calculate-btn');

            // Disable button to prevent multiple submissions
            calculateBtn.disabled = true;

            // Clear previous result and show spinner
            resultDiv.textContent = '';
            resultSpinner.classList.remove('d-none');

            // --- Basic Validation ---
            if (isNaN(totalAmount) || isNaN(amountReceived)) {
                resultDiv.textContent = 'Por favor, introduce importes válidos.';
                resultSpinner.classList.add('d-none'); // Hide spinner
                calculateBtn.disabled = false; // Re-enable button
                return;
            }

            if (amountReceived < totalAmount) {
                resultDiv.textContent = 'El importe recibido es menor que el total a pagar.';
                resultSpinner.classList.add('d-none'); // Hide spinner
                calculateBtn.disabled = false; // Re-enable button
                return;
            }

            try {
                const change = amountReceived - totalAmount;

                // Hide spinner
                resultSpinner.classList.add('d-none');

                // Format for display
                const lang = localStorage.getItem('language') || 'es';
                const translations = window.currentTranslations || (window.allTranslations ? window.allTranslations[lang] : null) || {};
                const changeTextForDisplayTemplate = translations.changeResultText || 'El cambio a devolver es: {change} €';
                const changeTextForDisplay = changeTextForDisplayTemplate.replace('{change}', change.toFixed(2));
                resultDiv.textContent = changeTextForDisplay;

                // Format for speech using the new helper function
                const speakableChange = formatChangeForSpeech(change);
                const changeIntro = translations.speechChangeResultText || "El cambio a devolver es:";
                const changeTextForSpeech = `${changeIntro} ${speakableChange}`;

                // Announce the result. This now happens in the background.
                speak(changeTextForSpeech);

                // Save to history
                saveToHistory({ total: totalAmount, received: amountReceived, change: change });

                // Re-enable the button and clear inputs for the next operation
                calculateBtn.disabled = false;
                document.getElementById('total-amount').value = '';
                document.getElementById('amount-received').value = '';
                document.getElementById('total-amount').focus(); // Set focus for the next calculation
            } catch (error) {
                // Handle any errors that might occur during calculation
                console.error('Error en el cálculo:', error);
                resultDiv.textContent = 'Ha ocurrido un error durante el cálculo. Por favor, inténtalo de nuevo.';
                resultSpinner.classList.add('d-none'); // Hide spinner
                calculateBtn.disabled = false; // Re-enable button immediately on error
            }
        });
    }

    // Attach speech recognition to the new buttons
    if (window.onceSpeech && window.onceSpeech.attachSpeechToInput) {
        window.onceSpeech.attachSpeechToInput('#mic-total-amount', '#total-amount', '#mic-status-total-amount');
        window.onceSpeech.attachSpeechToInput('#mic-amount-received', '#amount-received', '#mic-status-amount-received');
    }

    /**
     * Formats the change amount into a natural-sounding Spanish string for speech.
     * @param {number} change - The amount of change.
     * @returns {string} - A natural language string (e.g., "dos euros con cincuenta céntimos").
     */
    function formatChangeForSpeech(change) {
        const translations = window.currentTranslations || {};
        const euros = Math.floor(change);
        const cents = Math.round((change - euros) * 100);

        const euroSingular = translations.speechEuroSingular || 'euro';
        const euroPlural = translations.speechEuroPlural || 'euros';
        const centSingular = translations.speechCentSingular || 'céntimo';
        const centPlural = translations.speechCentPlural || 'céntimos';
        const con = translations.speechCon || 'con';
        const cero = translations.speechCero || 'cero';
        const oneEuro = translations.speechOneEuro || `un ${euroSingular}`;
        const oneCent = translations.speechOneCent || `un ${centSingular}`;

        if (euros === 0 && cents === 0) {
            return `${cero} ${euroPlural}`;
        }

        let parts = [];

        if (euros > 0) {
            if (euros === 1) {
                parts.push(oneEuro);
            } else {
                parts.push(`${euros} ${euroPlural}`);
            }
        }

        if (cents > 0) {
            if (cents === 1) {
                parts.push(oneCent);
            } else {
                parts.push(`${cents} ${centPlural}`);
            }
        }

        return parts.join(` ${con} `);
    }

    /**
     * Uses the SpeechSynthesis API to read text aloud.
     * This version includes a safety timeout to prevent the UI from freezing
     * if the `onend` event never fires.
     * @param {string} text - The text to be spoken.
     * @param {function} onEndCallback - A function to call when speech is finished.
     */
    function speak(text, onEndCallback) {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech

            const utterance = new SpeechSynthesisUtterance(text);
            const lang = localStorage.getItem('language') || 'es';
            const langMap = {
                es: 'es-ES', en: 'en-US', gl: 'gl-ES',
                ca: 'ca-ES', va: 'ca-ES', eu: 'eu-ES'
            };
            utterance.lang = langMap[lang] || 'es-ES';

            const voice = voices.find(v => v.lang === utterance.lang);
            if (voice) {
                utterance.voice = voice;
            }

            let spoken = false;
            const onEnd = () => {
                if (spoken) return; // Ensure the callback is only called once
                spoken = true;
                if (typeof onEndCallback === 'function') {
                    onEndCallback();
                }
            };

            utterance.onend = onEnd;
            utterance.onerror = (event) => {
                console.error('SpeechSynthesis Error:', event.error);
                onEnd(); // Ensure callback runs even on error
            };

            // Safety timeout: if speech doesn't end after 10 seconds, fire callback anyway
            setTimeout(onEnd, 10000);

            window.speechSynthesis.speak(utterance);
        } else {
            // If speech synthesis is not supported or text is empty, run the callback immediately
            if (typeof onEndCallback === 'function') {
                onEndCallback();
            }
        }
    }

    /**
     * Saves the transaction data asynchronously using a Web Worker.
     * @param {object} data - The transaction data.
     */
    function saveToHistory(data) {
        if (window.Worker) {
            const historyWorker = new Worker('assets/js/historyWorker.js');

            historyWorker.onmessage = (e) => {
                if (e.data.status === 'error') {
                    console.error('Error saving history in worker:', e.data.error);
                }
                historyWorker.terminate(); // Clean up the worker
            };

            historyWorker.onerror = (e) => {
                console.error(`Error in historyWorker: ${e.message}`, e);
                historyWorker.terminate(); // Clean up the worker
            };

            // The worker adds the timestamp, so we don't do it here.
            historyWorker.postMessage({ action: 'save', payload: data });
        } else {
            // Fallback for older browsers that don't support Web Workers.
            // This is the original synchronous code.
            try {
                const history = JSON.parse(localStorage.getItem('transactionHistory')) || [];
                data.timestamp = new Date().toLocaleString('es-ES');
                history.unshift(data);
                localStorage.setItem('transactionHistory', JSON.stringify(history));
            } catch (error) {
                console.error('Error saving history without worker:', error);
            }
        }
    }

    /**
     * Handles language selection buttons on the settings page.
     */
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        const langButtons = languageSelector.querySelectorAll('.lang-btn');

        const setActiveButton = () => {
            const currentLang = localStorage.getItem('language') || 'es';
            langButtons.forEach(btn => {
                if (btn.dataset.lang === currentLang) {
                    btn.classList.add('btn-primary');
                    btn.classList.remove('btn-secondary');
                } else {
                    btn.classList.add('btn-secondary');
                    btn.classList.remove('btn-primary');
                }
            });
        };

        langButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                // window.setLanguage is exposed by i18n.js
                if (window.setLanguage) {
                    window.setLanguage(lang).then(setActiveButton);
                }
            });
        });

        // Set initial state
        setActiveButton();
    }

    /**
     * Example function to demonstrate calling a mock Arduino API.
     * This is a placeholder for future integration.
     * @param {object} data - Data to be sent to the mock Arduino.
     */
    function sendToArduino(data) {
        console.log("Simulating sending data to Arduino:", data);
        // In a real scenario, this would be a fetch call to the API endpoint
        // fetch('/api/arduino', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data),
        // })
        // .then(response => response.json())
        // .then(result => {
        //     console.log('Arduino API response:', result);
        // });
    }
});

// --- BEGIN: Módulo de reconocimiento de voz (añadido por fix/speech-recognition)
;(function(window){
  'use strict';

  function createRecognition(onResultText) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const r = new SpeechRecognition();
    r.lang = 'es-ES';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.continuous = false;

    r.onstart = () => console.log('[speech] started');
    r.onend = () => console.log('[speech] ended');
    r.onerror = (e) => console.error('[speech] error', e);
    r.onresult = (ev) => {
      const transcript = Array.from(ev.results)
        .map(res => res[0].transcript)
        .join(' ')
        .trim();
      console.log('[speech] transcript:', transcript);
      onResultText(transcript);
    };

    return r;
  }

  // Normalización básica de frases en español a número (float euros)
  function parseSpanishAmount(text) {
    if (!text) return null;
    text = text.toLowerCase().trim();

    // Reemplazos rápidos comunes
    text = text.replace(/€/g, ' euros ');
    text = text.replace(/centimo[s]?/g, ' centimos ');
    text = text.replace(/\s+/g, ' ');

    // Si contiene formato numérico con coma o punto: extraer primer número válido
    const numMatch = text.match(/-?\d+[.,]?\d*/);
    if (numMatch) {
      let numStr = numMatch[0].replace(',', '.');
      const val = parseFloat(numStr);
      if (!isNaN(val)) return parseFloat(val.toFixed(2));
    }

    // "X euros con Y" o "X euros Y centimos"
    const eurosConMatch = text.match(/([\w\s-]+?)\s*(?:euros|euro)\s*(?:con\s*)?([\w\s-]+?)\s*(?:centimos|centimo)?$/);
    if (eurosConMatch) {
      const eurosText = eurosConMatch[1].trim();
      const centsText = eurosConMatch[2].trim();
      const euros = wordsToNumber(esToDigits(eurosText));
      const cents = wordsToNumber(esToDigits(centsText));
      if (euros != null && cents != null) {
        return parseFloat((euros + (cents / 100)).toFixed(2));
      }
    }

    // "X coma Y" o "X punto Y"
    const commaPointMatch = text.match(/([\w\s-]+)\s*(?:coma|punto)\s*([\w\s-]+)/);
    if (commaPointMatch) {
      const left = wordsToNumber(esToDigits(commaPointMatch[1].trim()));
      const right = wordsToNumber(esToDigits(commaPointMatch[2].trim()));
      if (left != null && right != null) {
        const rightStr = right.toString().padStart(2, '0');
        const finalVal = parseFloat(`${left}.${rightStr}`);
        return parseFloat(finalVal.toFixed(2));
      }
    }

    // Intentar convertir frase completa (ej: "veinticinco")
    const onlyWords = wordsToNumber(esToDigits(text));
    if (onlyWords != null) return parseFloat(onlyWords.toFixed(2));

    return null;
  }

  // ---------- util: conversión básica de palabras españolas a número
  const SMALL = {
    'cero':0,'uno':1,'dos':2,'tres':3,'cuatro':4,'cinco':5,'seis':6,'siete':7,'ocho':8,'nueve':9,
    'diez':10,'once':11,'doce':12,'trece':13,'catorce':14,'quince':15,'dieciseis':16,'dieciséis':16,
    'diecisiete':17,'dieciocho':18,'diecinueve':19,'veinte':20,'veintiuno':21,'veintidos':22,'veintidós':22,
    'treinta':30,'cuarenta':40,'cincuenta':50,'sesenta':60,'setenta':70,'ochenta':80,'noventa':90,
    'cien':100,'ciento':100,'doscientos':200,'trescientos':300,'cuatrocientos':400,'quinientos':500,
    'seiscientos':600,'setecientos':700,'ochocientos':800,'novecientos':900,'mil':1000
  };

  function esToDigits(text) {
    return text.replace(/[^a-z0-9áéíóúñ\s-]/gi, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function wordsToNumber(text) {
    if (!text) return null;
    text = text.trim().toLowerCase();
    if (/^-?\d+([.,]\d+)?$/.test(text)) return parseFloat(text.replace(',', '.'));
    const tokens = text.split(/[\s-]+/);
    let total = 0;
    let current = 0;
    for (let t of tokens) {
      if (SMALL.hasOwnProperty(t)) {
        const val = SMALL[t];
        if (val === 1000) {
          current = (current || 1) * 1000;
          total += current;
          current = 0;
        } else if (val >= 100) {
          current = (current || 1) * val;
        } else {
          current += val;
        }
      } else {
        return null;
      }
    }
    return total + current;
  }

  // API pública: atacha reconocimiento a botones/inputs
  function attachSpeechToInput(micBtnSelector, inputSelector, statusSelector) {
    const micBtn = document.querySelector(micBtnSelector);
    const input = document.querySelector(inputSelector);
    const status = document.querySelector(statusSelector);
    const r = createRecognition(async (transcript) => {
      if (status) status.textContent = 'Procesando...';
      const parsed = parseSpanishAmount(transcript);
      if (parsed != null) {
        if (input) input.value = parsed.toFixed(2);
        if (status) status.textContent = 'Valor reconocido';
      } else {
        if (status) status.textContent = 'No se pudo interpretar: ' + transcript;
      }
      setTimeout(()=> { if (status) status.textContent = ''; }, 2200);
    });

    if (!r) {
      if (micBtn) micBtn.disabled = true;
      if (status) status.textContent = 'Reconocimiento por voz no disponible en este navegador.';
      return;
    }

    micBtn && micBtn.addEventListener('click', async () => {
      try {
        if (status) status.textContent = 'Hablando...';
        r.start();
      } catch (err) {
        console.error('Could not start recognition', err);
        if (status) status.textContent = 'Error al iniciar micrófono';
      }
    });
  }

  // Exponer util en namespace global para que la UI existente lo invoque
  window.onceSpeech = window.onceSpeech || {};
  window.onceSpeech.attachSpeechToInput = attachSpeechToInput;

})(window);
// --- END: Módulo de reconocimiento de voz
