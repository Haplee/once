// Helper: get element safely
function getEl(selector, opts = {}) {
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

    // --- Theme Management ---
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

    // --- Calculator Logic ---
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

            // Client-side validation
            if (isNaN(totalAmount) || isNaN(amountReceived)) {
                resultDiv.textContent = 'Por favor, introduce importes válidos.'; // This should be translated
                if (resultSpinner) resultSpinner.classList.add('d-none');
                calculateBtn.disabled = false;
                return;
            }

            try {
                // 1. Call backend API to calculate change
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ total: totalAmount, received: amountReceived }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error en la comunicación con el servidor.');
                }

                const data = await response.json();
                const change = data.change;

                // 2. Display result and speak it
                if (resultSpinner) resultSpinner.classList.add('d-none');

                // Note: The display text is hardcoded for now, as the i18n is backend-driven.
                // A more advanced implementation would update this text via another API call or websocket.
                resultDiv.textContent = `El cambio a devolver es: ${change.toFixed(2)} €`;

                const speakableChange = formatChangeForSpeech(change);
                // This intro text is also hardcoded and should ideally come from the backend.
                const changeIntro = "El cambio a devolver es:";
                const changeTextForSpeech = `${changeIntro} ${speakableChange}`;
                speak(changeTextForSpeech, null);

                // 3. Save to history via API
                await fetch('/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ total: totalAmount, received: amountReceived, change: change }),
                });

            } catch (error) {
                console.error('Error en el proceso de cálculo:', error);
                resultDiv.textContent = error.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
                if (resultSpinner) resultSpinner.classList.add('d-none');
            } finally {
                calculateBtn.disabled = false;
            }
        });

        // Initialize speech recognition if the function exists
        if (window.initializeSpeechRecognition) {
            window.initializeSpeechRecognition();
        }
    }

    // This function remains client-side as it depends on browser APIs
    function speak(text, onEndCallback) {
        // Do not speak if running in test mode, to avoid CI errors.
        if (window.APP_IS_TESTING) {
            if (typeof onEndCallback === 'function') onEndCallback();
            return;
        }

        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);

            // Use the HTML lang attribute as the source of truth for language
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

    // This function is kept for formatting the spoken change.
    // It's a candidate for future improvement to make it language-dynamic from the backend.
    function formatChangeForSpeech(change) {
        const euros = Math.floor(change);
        const cents = Math.round((change - euros) * 100);

        // These are hardcoded Spanish words. This is a limitation of the current implementation.
        const euroSingular = 'euro';
        const euroPlural = 'euros';
        const centSingular = 'céntimo';
        const centPlural = 'céntimos';
        const con = 'con';
        const cero = 'cero';
        const oneEuro = `un ${euroSingular}`;
        const oneCent = `un ${centSingular}`;

        if (euros === 0 && cents === 0) return `${cero} ${euroPlural}`;
        let parts = [];
        if (euros > 0) parts.push(euros === 1 ? oneEuro : `${euros} ${euroPlural}`);
        if (cents > 0) parts.push(cents === 1 ? oneCent : `${cents} ${centPlural}`);
        return parts.join(` ${con} `);
    }
});

// The speech recognition parts remain unchanged as they are client-side only.
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
    const numericText = text.trim().toLowerCase();
    if (/^-?\d+([.,]\d+)?$/.test(numericText)) {
        return parseFloat(numericText.replace(',', '.'));
    }
    const tokens = numericText.split(/[\s-]+/);
    const groups = [];
    let currentGroup = [];
    for (const token of tokens) {
        if (token === 'mil') {
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
        if (groupTokens.length === 1 && groupTokens[0] === 'un' && groupCount > 1) {
            groupTokens = ['uno'];
        }
        let current = 0;
        for (let j = 0; j < groupTokens.length; j++) {
            const t = groupTokens[j];
            if (t === 'y') continue;
            if (SMALL_WORDS.hasOwnProperty(t)) {
                const val = SMALL_WORDS[t];
                if (val >= 100) {
                    groupValue += (current > 0 ? current : 1) * val;
                    current = 0;
                } else {
                    current += val;
                }
            } else {
                return null;
            }
        }
        groupValue += current;
        const multiplier = Math.pow(1000, groupCount - 1 - i);
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
    const timeMatch = normalizedText.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
        const potentialNumber = timeMatch[0].replace(':', '.');
        const val = parseFloat(potentialNumber);
        if (!isNaN(val)) {
            return parseFloat(val.toFixed(2));
        }
    }
    normalizedText = normalizedText.replace(/€/g, ' euros ').replace(/centimo[s]?/g, ' centimos ').replace(/\s+/g, ' ');
    const numMatch = normalizedText.match(/-?\d+([.,]\d*)?/);
    if (numMatch) {
        const numStr = numMatch[0].replace(',', '.');
        const val = parseFloat(numStr);
        if (!isNaN(val)) return parseFloat(val.toFixed(2));
    }
    const eurosYMatch = normalizedText.match(/([\w\s-]+?)\s*(?:euros|euro)\s+y\s+([\w\s-]+?)\s*(?:centimos)?$/);
    if (eurosYMatch) {
        const euros = wordsToNumber(esToDigits(eurosYMatch[1].trim()));
        const cents = wordsToNumber(esToDigits(eurosYMatch[2].trim()));
        if (euros != null && cents != null) return parseFloat((euros + (cents / 100)).toFixed(2));
    }
    const eurosConMatch = normalizedText.match(/([\w\s-]+?)\s*(?:euros|euro)?\s*con\s*([\w\s-]+?)\s*(?:centimos)?$/);
    if (eurosConMatch) {
        const euros = wordsToNumber(esToDigits(eurosConMatch[1].trim()));
        const cents = wordsToNumber(esToDigits(eurosConMatch[2].trim()));
        if (euros != null && cents != null) return parseFloat((euros + (cents / 100)).toFixed(2));
    }
    const commaPointMatch = normalizedText.match(/([\w\s-]+)\s*(?:coma|punto)\s*([\w\s-]+)/);
    if (commaPointMatch) {
        const left = wordsToNumber(esToDigits(commaPointMatch[1].trim()));
        const right = wordsToNumber(esToDigits(commaPointMatch[2].trim()));
        if (left != null && right != null) {
            const rightStr = right.toString().padStart(2, '0');
            return parseFloat(parseFloat(`${left}.${rightStr}`).toFixed(2));
        }
    }
    const parts = normalizedText.split(' ');
    if (parts.length === 2 && !normalizedText.includes(' y ')) {
        const euros = wordsToNumber(esToDigits(parts[0]));
        const cents = wordsToNumber(esToDigits(parts[1]));
        if (euros != null && cents != null && cents > 0 && cents < 100) {
            if (wordsToNumber(esToDigits(normalizedText)) === euros + cents && euros < 20) {
                return parseFloat((euros + (cents / 100)).toFixed(2));
            }
        }
    }
    const eurosOnlyMatch = normalizedText.match(/([\w\s-]+?)\s*(?:euros|euro)$/);
    if (eurosOnlyMatch) {
        const euros = wordsToNumber(esToDigits(eurosOnlyMatch[1].trim()));
        if (euros != null) return parseFloat(euros.toFixed(2));
    }
    const centsOnlyMatch = normalizedText.match(/([\w\s-]+?)\s*centimos$/);
    if (centsOnlyMatch) {
        const cents = wordsToNumber(esToDigits(centsOnlyMatch[1].trim()));
        if (cents != null) return parseFloat((cents / 100).toFixed(2));
    }
    const onlyWords = wordsToNumber(esToDigits(normalizedText));
    if (onlyWords != null) return parseFloat(onlyWords.toFixed(2));
    return null;
}

// Speech Recognition Module
const _SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
window._SpeechRecognitionAvailable = !!_SpeechRecognition;
console.log('[speech] Feature detect - SpeechRecognition available?', window._SpeechRecognitionAvailable);
window.recognition = null;
let _isRecognizing = false;
let _micHandler = null;

function isMobileSafari() {
    try {
        return /iP(hone|od|ad)/i.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(navigator.userAgent);
    } catch (e) { return false; }
}

function createRecognitionInstance() {
    if (!_SpeechRecognition) return null;
    try {
        const rec = new _SpeechRecognition();
        rec.lang = 'es-ES';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false;
        rec.onstart = () => { _isRecognizing = true; console.log('[speech] rec.onstart'); };
        rec.onend = () => { _isRecognizing = false; console.log('[speech] rec.onend'); };
        rec.onerror = (ev) => { _isRecognizing = false; console.error('[speech] rec.onerror', ev.error || ev); };
        window.recognition = rec;
        return rec;
    } catch (err) {
        console.error('[speech] Failed to create recognition instance:', err);
        return null;
    }
}

function initializeSpeechRecognition() {
    const micBtn = getEl('#mic-btn', { type: 'qs', silent: true });
    const statusSpan = getEl('#mic-status', { type: 'qs', silent: true });
    const totalAmountInput = getEl('total-amount', { type: 'id', silent: true });
    const amountReceivedInput = getEl('amount-received', { type: 'id', silent: true });

    if (!_SpeechRecognition || isMobileSafari()) {
        if (micBtn) micBtn.disabled = true;
        if (statusSpan) statusSpan.textContent = 'Reconocimiento de voz no disponible.';
        return;
    }
    if (!micBtn || !statusSpan || !totalAmountInput || !amountReceivedInput) {
        if (micBtn) micBtn.disabled = true;
        return;
    }

    let rec = window.recognition || createRecognitionInstance();
    if (!rec) {
        if (micBtn) micBtn.disabled = true;
        if (statusSpan) statusSpan.textContent = 'No se pudo inicializar el reconocimiento.';
        return;
    }

    rec.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript?.trim().toLowerCase() || '';
        if (statusSpan) statusSpan.textContent = 'Procesando...';
        let totalStr = '', receivedStr = '';
        const keywords = ['paga con', 'me da', 'le doy', 'recibido', 'entrego', 'pagan'];
        let separatorKeyword = null, separatorIndex = -1;
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
        if (totalAmount != null) totalAmountInput.value = totalAmount.toFixed(2);
        if (amountReceived != null) amountReceivedInput.value = amountReceived.toFixed(2);
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

    if (_micHandler && micBtn) {
        try { micBtn.removeEventListener('click', _micHandler); } catch (e) {}
    }
    _micHandler = () => {
        if (_isRecognizing) {
            try { rec.stop(); } catch (e) { try { rec.abort(); } catch(_){} }
            return;
        }
        try {
            if (!window.recognition) rec = createRecognitionInstance();
            if (!rec) throw new Error('No recognition instance');
            try { rec.abort(); } catch(e) {}
            rec.start();
        } catch (err) {
            console.error('[speech] Error starting recognition:', err);
            if (statusSpan) statusSpan.textContent = 'Error al iniciar reconocimiento.';
            setTimeout(() => { if (statusSpan) statusSpan.textContent = ''; }, 2500);
        }
    };
    if (micBtn) {
        micBtn.addEventListener('click', _micHandler);
        micBtn.disabled = false;
    }
    document.removeEventListener('visibilitychange', window._speechVisibilityHandler || (() => {}));
    window._speechVisibilityHandler = () => {
        if (document.hidden && window.recognition && _isRecognizing) {
            try { window.recognition.stop(); } catch (e) { try { window.recognition.abort(); } catch(_){} }
        }
    };
    document.addEventListener('visibilitychange', window._speechVisibilityHandler);
}

window.initializeSpeechRecognition = initializeSpeechRecognition;
