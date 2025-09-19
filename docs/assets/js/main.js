// Helper: get element safely
function getEl(selector, opts = {}) {
    // opts.type: 'id'|'qs' for logging clarity
    const el = opts.type === 'id' ? document.getElementById(selector) : document.querySelector(selector);
    if (!el && !opts.silent) {
        console.warn(`[getEl] Elemento no encontrado: ${selector}`, opts);
    }
    return el;
}

document.addEventListener('DOMContentLoaded', () => {
    let voices = [];

    const populateVoiceList = () => {
        voices = window.speechSynthesis.getVoices();
    };

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    const applyTheme = () => {
        let theme = localStorage.getItem('theme');
        if (!theme) {
            theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode';
            localStorage.setItem('theme', theme);
        }
        document.body.classList.toggle('dark-mode', theme === 'dark-mode');
        const themeToggleButton = getEl('theme-toggle', { type: 'id', silent: true });
        if (themeToggleButton) {
            themeToggleButton.checked = theme === 'dark-mode';
        }
    };

    applyTheme();

    const themeToggleButton = getEl('theme-toggle', { type: 'id', silent: true });
    if (themeToggleButton) {
        themeToggleButton.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark-mode' : 'light-mode';
            localStorage.setItem('theme', newTheme);
            applyTheme();
        });
    }

    const form = getEl('change-form', { type: 'id' });
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const totalAmountInput = getEl('total-amount', { type: 'id' });
            const amountReceivedInput = getEl('amount-received', { type: 'id' });
            const resultDiv = getEl('result', { type: 'id' });
            const resultSpinner = getEl('result-spinner', { type: 'id', silent: true });
            const calculateBtn = getEl('calculate-btn', { type: 'id' });

            const totalAmount = parseFloat(totalAmountInput.value);
            const amountReceived = parseFloat(amountReceivedInput.value);

            calculateBtn.disabled = true;
            resultDiv.textContent = '';
            if (resultSpinner) resultSpinner.classList.remove('d-none');

            // Client-side validation remains
            if (isNaN(totalAmount) || isNaN(amountReceived)) {
                resultDiv.textContent = 'Por favor, introduce importes válidos.';
                if (resultSpinner) resultSpinner.classList.add('d-none');
                calculateBtn.disabled = false;
                return;
            }

            if (amountReceived < totalAmount) {
                resultDiv.textContent = 'El importe recibido es menor que el total a pagar.';
                if (resultSpinner) resultSpinner.classList.add('d-none');
                calculateBtn.disabled = false;
                return;
            }

            try {
                // Call backend API to calculate change
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ total: totalAmount, received: amountReceived }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error en la comunicación con el servidor.');
                }

                const data = await response.json();
                const change = data.change;

                if (resultSpinner) resultSpinner.classList.add('d-none');

                // The text for display is now hardcoded in the template, so we just update the dynamic part.
                // This will be improved when the whole display is rendered by the backend.
                resultDiv.textContent = `El cambio a devolver es: ${change.toFixed(2)} €`;

                const speakableChange = formatChangeForSpeech(change);
                const changeIntro = "El cambio a devolver es:"; // This should also come from backend eventually
                const changeTextForSpeech = `${changeIntro} ${speakableChange}`;

                speak(changeTextForSpeech, null);

                // Save to history via API
                await fetch('/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ total: totalAmount, received: amountReceived, change: change }),
                });

            } catch (error) {
                console.error('Error en el cálculo o guardado:', error);
                resultDiv.textContent = error.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
                if (resultSpinner) resultSpinner.classList.add('d-none');
            } finally {
                calculateBtn.disabled = false;
            }
        });

        if (window.initializeSpeechRecognition) {
            window.initializeSpeechRecognition();
        }
    }

    function formatChangeForSpeech(change) {
        // This function remains as it is, but ideally the translated parts would be fetched from the server
        // For now, we keep the JS-based translation as a fallback.
        const translations = window.currentTranslations || {}; // Assuming this might still exist for speech parts
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

        if (euros === 0 && cents === 0) return `${cero} ${euroPlural}`;
        let parts = [];
        if (euros > 0) parts.push(euros === 1 ? oneEuro : `${euros} ${euroPlural}`);
        if (cents > 0) parts.push(cents === 1 ? oneCent : `${cents} ${centPlural}`);
        return parts.join(` ${con} `);
    }

    function speak(text, onEndCallback) {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const lang = document.documentElement.lang || 'es';
            const langMap = { es: 'es-ES', en: 'en-US', gl: 'gl-ES', ca: 'ca-ES', va: 'ca-ES', eu: 'eu-ES' };
            utterance.lang = langMap[lang] || 'es-ES';

            const voice = voices.find(v => v.lang === utterance.lang);
            if (voice) utterance.voice = voice;

            let spoken = false;
            const onEnd = () => {
                if (spoken) return;
                spoken = true;
                if (typeof onEndCallback === 'function') onEndCallback();
            };

            utterance.onend = onEnd;
            utterance.onerror = (event) => {
                console.error('SpeechSynthesis Error:', event.error);
                onEnd();
            };
            setTimeout(onEnd, 10000); // Safety timeout
            window.speechSynthesis.speak(utterance);
        } else {
            if (typeof onEndCallback === 'function') onEndCallback();
        }
    }
});

// Helper functions for parsing Spanish numbers from text
const SMALL_WORDS = {
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

    // Direct match for digits first
    const numericText = text.trim().toLowerCase();
    if (/^-?\d+([.,]\d+)?$/.test(numericText)) {
        return parseFloat(numericText.replace(',', '.'));
    }

    const tokens = numericText.split(/[\s-]+/);
    const groups = [];

    // Group numbers by "mil"
    let currentGroup = [];
    for (const token of tokens) {
        if (token === 'mil') {
            // "mil" acts as a separator
            groups.push(currentGroup);
            currentGroup = [];
        } else {
            currentGroup.push(token);
        }
    }
    groups.push(currentGroup);

    let total = 0;
    const groupCount = groups.length;

    for (let i = 0; i < groupCount; i++) {
        let groupValue = 0;
        let groupTokens = groups[i];

        // Handle "un" before "mil" -> becomes 1 for calculation
        if (groupTokens.length === 1 && groupTokens[0] === 'un' && groupCount > 1) {
            groupTokens = ['uno'];
        }

        let current = 0;

        // Process tokens within each group (e.g., "doscientos treinta y cinco")
        for (let j = 0; j < groupTokens.length; j++) {
            const t = groupTokens[j];

            if (t === 'y') continue; // Skip 'y', it's just a connector

            if (SMALL_WORDS.hasOwnProperty(t)) {
                const val = SMALL_WORDS[t];
                if (val >= 100) { // Cientos
                    // Handles "ciento" correctly
                    groupValue += (current > 0 ? current : 1) * val;
                    current = 0;
                } else { // Decenas y unidades
                    current += val;
                }
            } else {
                // If a word is not a number or connector, parsing fails for this group
                return null;
            }
        }
        groupValue += current;

        // Apply "mil" multiplier
        const multiplier = Math.pow(1000, groupCount - 1 - i);

        // Handle cases like "mil" (group is empty but represents 1000)
        if (groupValue === 0 && multiplier >= 1000) {
            groupValue = 1;
        }

        total += groupValue * multiplier;
    }

    return total;
}

function parseSpanishAmount(text) {
    if (!text) return null;

    let normalizedText = text.toLowerCase().trim();

    // Handle time-like format from speech recognition e.g., "5:50"
    const timeMatch = normalizedText.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
        const potentialNumber = timeMatch[0].replace(':', '.');
        const val = parseFloat(potentialNumber);
        if (!isNaN(val)) {
            return parseFloat(val.toFixed(2));
        }
    }
    // Normalize currency symbols and common words, but leave "y" alone for now.
    normalizedText = normalizedText.replace(/€/g, ' euros ');
    normalizedText = normalizedText.replace(/centimo[s]?/g, ' centimos ');
    normalizedText = normalizedText.replace(/\s+/g, ' '); // Collapse multiple spaces

    // 1. Direct number match (e.g., "2,50", "2.50", "25")
    // This is the most reliable, so we check it first.
    const numMatch = normalizedText.match(/-?\d+([.,]\d*)?/);
    if (numMatch) {
        const numStr = numMatch[0].replace(',', '.');
        const val = parseFloat(numStr);
        if (!isNaN(val)) return parseFloat(val.toFixed(2));
    }

    // 2. "X euros y Y [centimos]" (e.g., "dos euros y cincuenta")
    const eurosYMatch = normalizedText.match(/([\w\s-]+?)\s*(?:euros|euro)\s+y\s+([\w\s-]+?)\s*(?:centimos)?$/);
    if (eurosYMatch) {
        const eurosPart = eurosYMatch[1].trim();
        const centsPart = eurosYMatch[2].trim();
        const euros = wordsToNumber(esToDigits(eurosPart));
        const cents = wordsToNumber(esToDigits(centsPart));
        if (euros != null && cents != null) {
            return parseFloat((euros + (cents / 100)).toFixed(2));
        }
    }

    // 3. "X [euros] con Y [centimos]" (flexible)
    const eurosConMatch = normalizedText.match(/([\w\s-]+?)\s*(?:euros|euro)?\s*con\s*([\w\s-]+?)\s*(?:centimos)?$/);
    if (eurosConMatch) {
        const eurosPart = eurosConMatch[1].trim();
        const centsPart = eurosConMatch[2].trim();
        const euros = wordsToNumber(esToDigits(eurosPart));
        const cents = wordsToNumber(esToDigits(centsPart));
        if (euros != null && cents != null) {
            return parseFloat((euros + (cents / 100)).toFixed(2));
        }
    }

    // 4. "X coma/punto Y"
    const commaPointMatch = normalizedText.match(/([\w\s-]+)\s*(?:coma|punto)\s*([\w\s-]+)/);
    if (commaPointMatch) {
        const left = wordsToNumber(esToDigits(commaPointMatch[1].trim()));
        const right = wordsToNumber(esToDigits(commaPointMatch[2].trim()));
        if (left != null && right != null) {
            const rightStr = right.toString().padStart(2, '0');
            const finalVal = parseFloat(`${left}.${rightStr}`);
            return parseFloat(finalVal.toFixed(2));
        }
    }

    // 5. Heuristic for "X Y" format (e.g., "siete cincuenta" -> 7.50)
    const parts = normalizedText.split(' ');
    if (parts.length === 2 && !normalizedText.includes(' y ')) {
        const eurosPart = parts[0];
        const centsPart = parts[1];
        const euros = wordsToNumber(esToDigits(eurosPart));
        const cents = wordsToNumber(esToDigits(centsPart));

        if (euros != null && cents != null && cents > 0 && cents < 100) {
            const combined = wordsToNumber(esToDigits(normalizedText));
            if (combined != null && combined === euros + cents && euros < 20) {
                return parseFloat((euros + (cents / 100)).toFixed(2));
            }
        }
    }

    // 6. "X euros"
    const eurosOnlyMatch = normalizedText.match(/([\w\s-]+?)\s*(?:euros|euro)$/);
    if (eurosOnlyMatch) {
        const euros = wordsToNumber(esToDigits(eurosOnlyMatch[1].trim()));
        if (euros != null) return parseFloat(euros.toFixed(2));
    }

    // 7. "Y centimos"
    const centsOnlyMatch = normalizedText.match(/([\w\s-]+?)\s*centimos$/);
    if (centsOnlyMatch) {
        const cents = wordsToNumber(esToDigits(centsOnlyMatch[1].trim()));
        if (cents != null) return parseFloat((cents / 100).toFixed(2));
    }

    // 8. Just a number word (e.g., "veinticinco")
    const onlyWords = wordsToNumber(esToDigits(normalizedText));
    if (onlyWords != null) return parseFloat(onlyWords.toFixed(2));

    return null; // Return null if no pattern matches
}

// --- BEGIN: Conservative & Debuggable Speech Recognition Module ---

// Detect variants
const _SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

// Expose for debugging
window._SpeechRecognitionAvailable = !!_SpeechRecognition;

console.log('[speech] Feature detect - SpeechRecognition available?', window._SpeechRecognitionAvailable);

// Global recognition instance (conservative: recreate if needed)
window.recognition = window.recognition || null;
let _isRecognizing = false;
let _micHandler = null;

/** Detect iOS Safari (common source of unsupported SpeechRecognition) */
function isMobileSafari() {
    try {
        const ua = navigator.userAgent || '';
        return /iP(hone|od|ad)/i.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
    } catch (e) {
        return false;
    }
}

/** Create or reset the global recognition instance */
function createRecognitionInstance() {
    if (!_SpeechRecognition) {
        console.warn('[speech] No SpeechRecognition constructor available.');
        window.recognition = null;
        return null;
    }

    try {
        // Always create fresh instance to avoid stale event handlers
        const rec = new _SpeechRecognition();
        rec.lang = 'es-ES';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false;

        // Safe handlers (lightweight)
        rec.onstart = () => {
            _isRecognizing = true;
            console.log('[speech] rec.onstart');
        };
        rec.onend = () => {
            _isRecognizing = false;
            console.log('[speech] rec.onend');
        };
        rec.onerror = (ev) => {
            _isRecognizing = false;
            console.error('[speech] rec.onerror', ev && ev.error ? ev.error : ev);
        };
        rec.onresult = (ev) => {
            console.log('[speech] rec.onresult', ev);
            // result handling will be delegated in initializeSpeechRecognition to capture current UI elements
        };

        // Expose globally so you can inspect it from console
        window.recognition = rec;
        console.log('[speech] recognition instance created and exposed as window.recognition');
        return rec;
    } catch (err) {
        console.error('[speech] Failed to create recognition instance:', err);
        window.recognition = null;
        return null;
    }
}

/** Main initializer to bind UI and handlers. Safe to call multiple times. */
function initializeSpeechRecognition() {
    const micBtn = getEl('#mic-btn', { type: 'qs', silent: true });
    const statusSpan = getEl('#mic-status', { type: 'qs', silent: true });
    const totalAmountInput = getEl('total-amount', { type: 'id', silent: true });
    const amountReceivedInput = getEl('amount-received', { type: 'id', silent: true });

    console.log('[speech] initializeSpeechRecognition called', {
        micBtnExists: !!micBtn, statusSpanExists: !!statusSpan,
        totalExists: !!totalAmountInput, receivedExists: !!amountReceivedInput,
        mobileSafari: isMobileSafari()
    });

    // If no API support or mobile Safari, disable gracefully
    if (!_SpeechRecognition || isMobileSafari()) {
        if (micBtn) micBtn.disabled = true;
        if (statusSpan) statusSpan.textContent = 'Reconocimiento de voz no disponible en este navegador.';
        console.warn('[speech] SpeechRecognition not supported or running on mobile Safari — mic disabled.');
        return;
    }

    // Require UI elements to operate
    if (!micBtn || !statusSpan || !totalAmountInput || !amountReceivedInput) {
        console.warn('[speech] Missing UI elements for mic; disabling mic if present.');
        if (micBtn) micBtn.disabled = true;
        return;
    }

    // Ensure we have a recognition instance
    let rec = window.recognition;
    if (!rec) rec = createRecognitionInstance();
    if (!rec) {
        if (micBtn) micBtn.disabled = true;
        if (statusSpan) statusSpan.textContent = 'No se pudo inicializar el reconocimiento de voz.';
        return;
    }

    // Attach dynamic result handler that closes over current inputs/statusSpan
    rec.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript?.trim().toLowerCase() || '';

        console.log('[speech] Transcript:', transcript);

        if (statusSpan) statusSpan.textContent = 'Procesando...';

        let totalStr = '';
        let receivedStr = '';

        // Keywords ordered by specificity to avoid ambiguity
        const keywords = ['paga con', 'me da', 'le doy', 'recibido', 'entrego', 'pagan'];
        let separatorKeyword = null;
        let separatorIndex = -1;

        for (const key of keywords) {
            const index = transcript.indexOf(key);
            if (index !== -1) {
                separatorKeyword = key;
                separatorIndex = index;
                break;
            }
        }

        if (separatorIndex !== -1) {
            totalStr = transcript.substring(0, separatorIndex).trim();
            receivedStr = transcript.substring(separatorIndex + separatorKeyword.length).trim();
        } else {
            totalStr = transcript;
        }

        const totalAmount = parseSpanishAmount(totalStr);
        const amountReceived = parseSpanishAmount(receivedStr);

        if (totalAmount != null && totalAmountInput) {
            totalAmountInput.value = totalAmount.toFixed(2);
        }

        if (amountReceived != null && amountReceivedInput) {
            amountReceivedInput.value = amountReceived.toFixed(2);
        }

        if (totalAmount != null || amountReceived != null) {
            if (statusSpan) statusSpan.textContent = 'Valores reconocidos';
        } else {
            if (statusSpan) statusSpan.textContent = 'No se pudo interpretar.';

        }
        setTimeout(() => { if (statusSpan) statusSpan.textContent = ''; }, 2500);
    };

    rec.onerror = (event) => {
        console.error('[speech] rec.onerror (from initializer):', event);
        if (statusSpan) statusSpan.textContent = `Error: ${event?.error || 'desconocido'}`;
        setTimeout(() => { if (statusSpan) statusSpan.textContent = ''; }, 2500);
    };


    // Manage click handler safely (remove previous if present)
    if (_micHandler && micBtn) {
        try { micBtn.removeEventListener('click', _micHandler); } catch (e) { /* ignore */ }
        _micHandler = null;
    }

    _micHandler = () => {

        // Toggle behavior: if recognizing, stop
        if (_isRecognizing) {
            try { rec.stop(); } catch (e) { try { rec.abort(); } catch(_){} }
            return;
        }


        // Try to start
        try {
            // ensure fresh instance just before start (some browsers require this after permission changes)
            if (!window.recognition) {
                rec = createRecognitionInstance();
                if (!rec) throw new Error('No recognition instance available');
            }
            // reset state and start
            try { rec.abort(); } catch(e) { /* ignore */ }
            rec.start();
            console.log('[speech] recognition.start() called');
        } catch (err) {
            console.error('[speech] Error starting recognition:', err);
            if (statusSpan) statusSpan.textContent = 'Error al iniciar reconocimiento.';
            setTimeout(() => { if (statusSpan) statusSpan.textContent = ''; }, 2500);
        }
    };

    // Add the click listener
    if (micBtn) {
        micBtn.addEventListener('click', _micHandler);
        micBtn.disabled = false;
    }

    // Stop recognition on visibility change (background)
    document.removeEventListener('visibilitychange', window._speechVisibilityHandler || (() => {}));
    window._speechVisibilityHandler = () => {
        if (document.hidden && window.recognition && _isRecognizing) {
            try { window.recognition.stop(); } catch (e) { try { window.recognition.abort(); } catch(_){} }
        }
    };
    document.addEventListener('visibilitychange', window._speechVisibilityHandler);

    console.log('[speech] initializeSpeechRecognition completed.');
}

// Expose initializer
window.initializeSpeechRecognition = initializeSpeechRecognition;

// --- END: Conservative & Debuggable Speech Recognition Module ---
