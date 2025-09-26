// Helper: get element safely
function getEl(selector, opts = {}) {
    const el = opts.type === 'id' ? document.getElementById(selector) : document.querySelector(selector);
    if (!el && !opts.silent) {
        console.warn(`[getEl] Element not found: ${selector}`, opts);
    }
    return el;
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if translations are loaded
    if (!window.translations) {
        console.error("Translations not found. Aborting main.js initialization.");
        return;
    }

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

            if (isNaN(totalAmount) || isNaN(amountReceived)) {
                resultDiv.textContent = window.t('invalidInputText');
                if (resultSpinner) resultSpinner.classList.add('d-none');
                calculateBtn.disabled = false;
                return;
            }

            try {
                const response = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ total: totalAmount, received: amountReceived }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || window.t('serverCommunicationError'));
                }

                const data = await response.json();
                const change = data.change;

                if (resultSpinner) resultSpinner.classList.add('d-none');
                resultDiv.textContent = window.t('changeResultText', { change: change.toFixed(2) });

                const speakableChange = formatChangeForSpeech(change);
                const changeIntro = window.t('speechChangeToReturn');
                const changeTextForSpeech = `${changeIntro} ${speakableChange}`;
                speak(changeTextForSpeech, null);

                await fetch('/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ total: totalAmount, received: amountReceived, change: change }),
                });

            } catch (error) {
                console.error('Calculation process error:', error);
                resultDiv.textContent = error.message || window.t('genericError');
                if (resultSpinner) resultSpinner.classList.add('d-none');
            } finally {
                calculateBtn.disabled = false;
            }
        });

        // This function is defined globally in the scope of the DOMContentLoaded event
        // so it can be called from the speech recognition module initializer.
        function formatChangeForSpeech(change) {
            const euros = Math.floor(change);
            const cents = Math.round((change - euros) * 100);

            if (euros === 0 && cents === 0) return `${window.t('speechZero')} ${window.t('speechEuroPlural')}`;

            let parts = [];
            if (euros > 0) {
                parts.push(euros === 1 ? window.t('speechOneEuro') : `${euros} ${window.t('speechEuroPlural')}`);
            }
            if (cents > 0) {
                parts.push(cents === 1 ? window.t('speechOneCent') : `${cents} ${window.t('speechCentPlural')}`);
            }
            return parts.join(` ${window.t('speechWith')} `);
        }

        initializeSpeechRecognition(formatChangeForSpeech);
    }

    function speak(text, onEndCallback) {
        if (window.APP_IS_TESTING) {
            if (typeof onEndCallback === 'function') onEndCallback();
            return;
        }

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
            setTimeout(onEnd, 10000);
            window.speechSynthesis.speak(utterance);
        } else {
            if (typeof onEndCallback === 'function') onEndCallback();
        }
    }
});

function createAmountParser() {
    const smallWordsStr = window.t('smallWords');
    const SMALL_WORDS = smallWordsStr.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split(':');
        acc[normalize(key)] = parseInt(value, 10);
        return acc;
    }, {});

    function normalize(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function wordsToNumber(text) {
        if (!text) return null;
        const numericText = text.trim().toLowerCase();
        if (/^-?\d+([.,]\d+)?$/.test(numericText)) return parseFloat(numericText.replace(',', '.'));

        const tokens = normalize(numericText).split(/[\s-]+/);
        let total = 0;
        let current = 0;
        for (const token of tokens) {
            if (SMALL_WORDS.hasOwnProperty(token)) {
                const val = SMALL_WORDS[token];
                if (val >= 1000) { // Handle "mil" / "thousand"
                    current = current === 0 ? 1 : current;
                    total += current * val;
                    current = 0;
                } else if (val >= 100) { // Handle "cien" / "hundred"
                     current = current === 0 ? 1 : current;
                     total += current * val;
                     current = 0;
                } else {
                    current += val;
                }
            }
        }
        return total + current;
    }

    return {
        parse: (text) => {
            if (!text) return null;
            let normalizedText = text.toLowerCase().trim();
            const numMatch = normalizedText.match(/-?\d+([.,]\d*)?/);
            if (numMatch) {
                const numStr = numMatch[0].replace(',', '.');
                const val = parseFloat(numStr);
                if (!isNaN(val)) return parseFloat(val.toFixed(2));
            }
            const onlyWords = wordsToNumber(normalizedText);
            if (onlyWords != null) return parseFloat(onlyWords.toFixed(2));

            return null;
        }
    };
}

function initializeSpeechRecognition(formatChangeForSpeech) {
    const _SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!_SpeechRecognition) {
        const micBtn = getEl('#mic-btn', { type: 'qs', silent: true });
        if (micBtn) micBtn.disabled = true;
        const statusSpan = getEl('#mic-status', { type: 'qs', silent: true });
        if (statusSpan) statusSpan.textContent = window.t('speechRecognitionNotAvailable');
        return;
    }

    let recognition = null;
    let isRecognizing = false;
    let micHandler = null;

    const createRecognitionInstance = () => {
        const rec = new _SpeechRecognition();
        const lang = document.documentElement.lang || 'es';
        const langMap = { es: 'es-ES', en: 'en-US', gl: 'gl-ES', ca: 'ca-ES', va: 'ca-ES', eu: 'eu-ES' };
        rec.lang = langMap[lang] || 'es-ES';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.continuous = false;
        rec.onstart = () => { isRecognizing = true; };
        rec.onend = () => { isRecognizing = false; };
        rec.onerror = (ev) => { isRecognizing = false; console.error('[speech] rec.onerror', ev.error || ev); };
        return rec;
    };

    const micBtn = getEl('#mic-btn', { type: 'qs', silent: true });
    const statusSpan = getEl('#mic-status', { type: 'qs', silent: true });
    const totalAmountInput = getEl('total-amount', { type: 'id', silent: true });
    const amountReceivedInput = getEl('amount-received', { type: 'id', silent: true });

    if (!micBtn || !statusSpan || !totalAmountInput || !amountReceivedInput) return;

    recognition = createRecognitionInstance();
    const amountParser = createAmountParser();

    recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript?.trim().toLowerCase() || '';
        statusSpan.textContent = window.t('speechProcessing');

        const keywords = window.t('speechKeywords').split(',');
        let separatorKeyword = null;
        let separatorIndex = -1;
        for (const key of keywords) {
            const index = transcript.indexOf(key.trim());
            if (index !== -1) {
                separatorKeyword = key.trim();
                separatorIndex = index;
                break;
            }
        }

        let totalStr = separatorIndex !== -1 ? transcript.substring(0, separatorIndex).trim() : transcript;
        let receivedStr = separatorIndex !== -1 ? transcript.substring(separatorIndex + separatorKeyword.length).trim() : '';

        const totalAmount = amountParser.parse(totalStr);
        const amountReceived = amountParser.parse(receivedStr);

        if (totalAmount != null) totalAmountInput.value = totalAmount.toFixed(2);
        if (amountReceived != null) amountReceivedInput.value = amountReceived.toFixed(2);

        if (totalAmount != null || amountReceived != null) {
            statusSpan.textContent = window.t('speechRecognized');
        } else {
            statusSpan.textContent = window.t('speechNotInterpreted');
        }
        setTimeout(() => { statusSpan.textContent = ''; }, 2500);
    };

    recognition.onerror = (event) => {
        console.error('[speech] rec.onerror (from initializer):', event);
        statusSpan.textContent = window.t('speechError', { error: event?.error || 'unknown' });
        setTimeout(() => { statusSpan.textContent = ''; }, 2500);
    };

    if (micHandler) micBtn.removeEventListener('click', micHandler);
    micHandler = () => {
        if (isRecognizing) {
            try { recognition.stop(); } catch (e) { try { recognition.abort(); } catch(_){} }
            return;
        }
        try {
            if (!recognition) recognition = createRecognitionInstance();
            recognition.start();
        } catch (err) {
            console.error('[speech] Error starting recognition:', err);
            statusSpan.textContent = window.t('speechStartError');
            setTimeout(() => { statusSpan.textContent = ''; }, 2500);
        }
    };
    micBtn.addEventListener('click', micHandler);
    micBtn.disabled = false;
}