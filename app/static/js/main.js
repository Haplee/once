// Helper: get element safely
function getEl(selector, opts = {}) {
    const el = opts.type === 'id' ? document.getElementById(selector) : document.querySelector(selector);
    if (!el && !opts.silent) {
        console.warn(`[getEl] Elemento no encontrado: ${selector}`, opts);
    }
    return el;
}

// --- I18n Helper ---
/**
 * Simple translation function.
 * @param {string} key - The key of the string to translate.
 * @param {Object.<string, string>} [replacements] - An object of placeholders to replace.
 * @returns {string} The translated string.
 */
function t(key, replacements) {
    let text = window.currentTranslations?.[key] || key;
    if (replacements) {
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(`{${placeholder}}`, value);
        }
    }
    return text;
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
        themeToggleButton.addEventListener('change', function () {
            const newTheme = this.checked ? 'dark-mode' : 'light-mode';
            localStorage.setItem('theme', newTheme);
            applyTheme();
        });
    }

    // --- Calculator Logic ---
    const form = getEl('change-form', { type: 'id' });
    if (form) {
        form.addEventListener('submit', async function (e) {
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
                resultDiv.textContent = t('invalidInputText');
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
                    throw new Error(errorData.error || t('serverCommunicationError'));
                }

                const data = await response.json();
                const change = data.change;

                // 2. Display result and speak it
                if (resultSpinner) resultSpinner.classList.add('d-none');

                resultDiv.textContent = t('changeResultText', { change: change.toFixed(2) });

                const speakableChange = formatChangeForSpeech(change);
                const changeIntro = t('speechChangeResultText');
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
                resultDiv.textContent = error.message || t('genericError');
                if (resultSpinner) resultSpinner.classList.add('d-none');
            } finally {
                calculateBtn.disabled = false;
            }
        });

        // Initialize speech recognition
        initializeSpeechRecognition();
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

    function formatChangeForSpeech(change) {
        const euros = Math.floor(change);
        const cents = Math.round((change - euros) * 100);

        const euroSingular = t('speechEuroSingular');
        const euroPlural = t('speechEuroPlural');
        const centSingular = t('speechCentSingular');
        const centPlural = t('speechCentPlural');
        const con = t('speechCon');
        const cero = t('speechCero');
        const oneEuro = t('speechOneEuro');
        const oneCent = t('speechOneCent');

        if (euros === 0 && cents === 0) return `${cero} ${euroPlural}`;
        let parts = [];
        if (euros > 0) parts.push(euros === 1 ? oneEuro : `${euros} ${euroPlural}`);
        if (cents > 0) parts.push(cents === 1 ? oneCent : `${cents} ${centPlural}`);
        return parts.join(` ${con} `);
    }
});

// Helper functions for parsing Spanish numbers from text
const SMALL_WORDS = {
    'cero': 0, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9,
    'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15, 'dieciseis': 16, 'dieciséis': 16,
    'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20, 'veintiuno': 21, 'veintidos': 22, 'veintidós': 22,
    'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90,
    'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300, 'cuatrocientos': 400, 'quinientos': 500,
    'seiscientos': 600, 'setecientos': 700, 'ochocientos': 800, 'novecientos': 900, 'mil': 1000
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

// --- Speech Recognition ---
function initializeSpeechRecognition() {
    const micBtn = getEl('#mic-btn', { type: 'qs', silent: true });
    const statusSpan = getEl('#mic-status', { type: 'qs', silent: true });
    const totalAmountInput = getEl('total-amount', { type: 'id', silent: true });
    const amountReceivedInput = getEl('amount-received', { type: 'id', silent: true });

    let recognition = null;
    let isRecognizing = false;

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    const isRecognitionAvailable = !!SpeechRecognition;

    const isMobileSafari = () => {
        try {
            return /iP(hone|od|ad)/i.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(navigator.userAgent);
        } catch (e) { return false; }
    };

    if (!isRecognitionAvailable || isMobileSafari()) {
        if (micBtn) micBtn.disabled = true;
        if (statusSpan) statusSpan.textContent = t('voiceErrorUnsupported');
        return;
    }

    if (!micBtn || !statusSpan || !totalAmountInput || !amountReceivedInput) {
        if (micBtn) micBtn.disabled = true;
        return;
    }

    try {
        recognition = new SpeechRecognition();
    } catch (err) {
        console.error('[speech] Failed to create recognition instance:', err);
        if (micBtn) micBtn.disabled = true;
        if (statusSpan) statusSpan.textContent = t('voiceErrorInitFailed');
        return;
    }

    // Map internal language codes to BCP 47 language tags
    const langMap = { es: 'es-ES', en: 'en-US', gl: 'gl-ES', ca: 'ca-ES', va: 'ca-ES', eu: 'eu-ES' };
    const currentLang = document.documentElement.lang || 'es';
    recognition.lang = langMap[currentLang] || 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
        isRecognizing = true;
        console.log('[speech] Recognition started.');
    };

    recognition.onend = () => {
        isRecognizing = false;
        console.log('[speech] Recognition ended.');
    };

    recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript?.trim().toLowerCase() || '';
        if (statusSpan) statusSpan.textContent = t('voiceProcessing');

        let totalStr = '', receivedStr = '';
        // Get keywords from translations
        const keywordsStr = t('voiceKeywords');
        const keywords = keywordsStr && keywordsStr !== 'voiceKeywords' ? keywordsStr.split('|') : ['paga con', 'me da', 'le doy', 'recibido', 'entrego', 'pagan'];

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
            if (statusSpan) statusSpan.textContent = t('voiceValuesRecognized');
        } else {
            if (statusSpan) statusSpan.textContent = t('voiceInterpretError');
        }
        setTimeout(() => { if (statusSpan) statusSpan.textContent = ''; }, 2500);
    };

    recognition.onerror = (event) => {
        isRecognizing = false;
        console.error('[speech] Recognition error:', event.error);
        if (statusSpan) {
            let errorKey = 'voiceErrorGeneric';
            if (event.error === 'no-speech') errorKey = 'voiceErrorNoSpeech';
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') errorKey = 'voiceErrorPermission';
            statusSpan.textContent = t(errorKey, { error: event.error || 'unknown' });
        }
        setTimeout(() => { if (statusSpan) statusSpan.textContent = ''; }, 3500);
    };

    micBtn.addEventListener('click', () => {
        if (!recognition) return;
        if (isRecognizing) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (err) {
                console.error('[speech] Error starting recognition:', err);
                if (statusSpan) statusSpan.textContent = t('voiceErrorStart');
            }
        }
    });

    micBtn.disabled = false;

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && recognition && isRecognizing) {
            recognition.stop();
        }
    });
}