document.addEventListener('DOMContentLoaded', () => {
    const currentLang = document.documentElement.lang || 'es';
    console.log('App JS cargado. Idioma detectado:', currentLang);
    console.log('Contexto seguro (HTTPS):', window.isSecureContext);

    // --- Speech Synthesis Setup ---
    let voices = [];
    const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // --- Theme Manager ---
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
    if (themeToggle) {
        themeToggle.checked = storedTheme === 'dark';
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- Machine Model Manager ---
    const machineSelect = document.getElementById('machine-model');
    if (machineSelect) {
        const storedModel = localStorage.getItem('machineModel') || 'M';
        machineSelect.value = storedModel;
        machineSelect.addEventListener('change', (e) => {
            localStorage.setItem('machineModel', e.target.value);
            console.log('Machine Model set to:', e.target.value);
        });
    }

    // --- Voice Gender Manager ---
    const voiceGenderSelect = document.getElementById('voice-gender');
    if (voiceGenderSelect) {
        const storedGender = localStorage.getItem('voiceGender') || 'female';
        voiceGenderSelect.value = storedGender;
        voiceGenderSelect.addEventListener('change', (e) => {
            localStorage.setItem('voiceGender', e.target.value);
            console.log('Voice Gender set to:', e.target.value);
        });
    }

    // --- Calculator Logic ---
    const totalInput = document.getElementById('total');
    const receivedInput = document.getElementById('received');
    const calcForm = document.getElementById('calculator-form');

    // --- (Removed auto-announcement on blur to only speak the final change) ---
    // Previously announced values as they were entered, now we wait for the final result.

    async function performCalculation() {
        const total = parseFloat(totalInput.value);
        const received = parseFloat(receivedInput.value);
        const resultBox = document.getElementById('result-value');

        if (isNaN(total) || isNaN(received)) return;

        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ total, received })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error en el cálculo');
            }

            const data = await response.json();

            if (data.success) {
                const change = data.change.toFixed(2);
                resultBox.textContent = `€ ${change}`;

                const trans = window.currentTranslations || {};
                const [euros, cents] = change.split('.');
                const euroLabel = parseInt(euros) === 1 ? (trans.speechEuroSingular || 'euro') : (trans.speechEuroPlural || 'euros');
                let announcementText = `${euros} ${euroLabel}`;

                if (parseInt(cents) > 0) {
                    const conLabel = trans.speechCon || 'con';
                    announcementText += ` ${conLabel} ${cents}`;
                }

                // Optional: add localized prefix
                const prefix = trans.speechChangeResultText || '';
                announceResult(`${prefix} ${announcementText}`);

                const historyRes = await fetch('/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        total: data.total,
                        received: data.received,
                        change: data.change
                    })
                });

                if (!historyRes.ok) {
                    console.error('Error saving history:', await historyRes.text());
                }

                if (typeof sendSerialData === 'function') {
                    sendSerialData(`C:${change}`);
                }
            }
        } catch (err) {
            console.error('Calculation error:', err);
            const trans = window.currentTranslations || {};
            resultBox.textContent = 'Error';
            alert(trans.genericError || 'Error al realizar el cálculo: ' + err.message);
        }
    }

    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            performCalculation();
        });
    }

    // --- Voice Input ---
    const micBtn = document.getElementById('mic-btn');
    if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        let recognition = null;
        let isRecognizing = false;
        let silenceTimer;
        let finalTranscript = '';

        const setupRecognition = () => {
            recognition = new SpeechRecognition();
            const langMap = {
                'es': 'es-ES', 'en': 'en-US', 'ca': 'ca-ES',
                'gl': 'gl-ES', 'eu': 'eu-ES', 'fr': 'fr-FR', 'va': 'ca-ES'
            };
            recognition.lang = langMap[currentLang] || 'es-ES';
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => {
                isRecognizing = true;
                micBtn.classList.add('listening');
                console.log('Micrófono activo y escuchando...');
            };

            recognition.onresult = (event) => {
                clearTimeout(silenceTimer);
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                const resultText = document.getElementById('result-text');
                if (resultText) {
                    resultText.textContent = '"' + (finalTranscript + interimTranscript) + '"';
                    resultText.classList.remove('hidden');
                }
                silenceTimer = setTimeout(() => { recognition.stop(); }, 2000);
            };

            recognition.onerror = (event) => {
                console.error('Error de reconocimiento persistente:', event.error);
                micBtn.classList.remove('listening');
                isRecognizing = false;

                const trans = window.currentTranslations || {};
                let errorMsg = '';

                if (event.error === 'not-allowed') {
                    errorMsg = 'Permiso denegado. Haz clic en el candado 🔒 de la barra de direcciones y activa el Micrófono.';
                } else if (event.error === 'network') {
                    errorMsg = 'Error de red. El reconocimiento de voz necesita conexión a internet.';
                } else if (event.error === 'no-speech') {
                    console.log('Silencio detectado');
                    return;
                } else {
                    errorMsg = 'Error de voz: ' + event.error;
                }

                if (errorMsg) alert(errorMsg);
            };

            recognition.onend = () => {
                micBtn.classList.remove('listening');
                isRecognizing = false;
                if (finalTranscript) {
                    window.parseVoiceInput(finalTranscript);
                }
            };
        };

        micBtn.addEventListener('click', () => {
            if (isRecognizing) {
                recognition.stop();
            } else {
                try {
                    setupRecognition();
                    recognition.start();
                    micBtn.classList.add('listening'); // Feedback inmediato
                } catch (err) {
                    console.error('Error al iniciar micrófono:', err);
                    micBtn.classList.remove('listening');
                    alert('No se pudo iniciar el micro. Asegúrese de que no lo está usando otra app.');
                }
            }
        });
    } else {
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                alert('Su navegador no soporta entrada de voz. Use Chrome o Edge para esta función.');
            });
        }
    }

    window.parseVoiceInput = function (text) {
        console.log('Procesando voz original:', text);
        const trans = window.currentTranslations || {};
        const wordToNum = trans.wordToNum || {};
        const keywords = trans.voiceKeywords || 'paga con|me da';
        const separator = trans.voiceSplitSeparator || 'con';

        text = text.toLowerCase();

        // Check if the phrase contains payment keywords to reduce noise
        const keywordRegex = new RegExp(keywords, 'i');
        if (!keywordRegex.test(text) && !text.match(/\d/)) {
            console.log('Voz ignorada (sin palabras clave ni números)');
            return;
        }

        // 1. Handle decimal separators spoken as words early (contextual)
        const sepRegex = new RegExp(`(\\d+)\\s+(${separator})\\s+(\\d+)`, 'gi');
        text = text.replace(sepRegex, '$1.$3');

        // 2. Convert localized words to numbers
        let processedText = text;
        const sortedWords = Object.keys(wordToNum).sort((a, b) => b.length - a.length);
        for (const word of sortedWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            processedText = processedText.replace(regex, wordToNum[word]);
        }

        // 3. Composite numbers (e.g., "twenty five") and separators again
        processedText = processedText.replace(/(\d+)\s+(\d+)/g, (m, p1, p2) => {
            if (parseInt(p1) > parseInt(p2) && parseInt(p2) < 10) return parseInt(p1) + parseInt(p2);
            return m;
        });
        processedText = processedText.replace(sepRegex, '$1.$3');

        // 4. Extract all numeric patterns
        const numbers = processedText.match(/[\d]+([.,][\d]+)?/g);
        console.log('Números detectados:', numbers);

        if (numbers && numbers.length >= 2) {
            const cleanNums = numbers.map(n => parseFloat(n.replace(',', '.')));
            let n1 = cleanNums[0];
            let n2 = cleanNums[1];

            if (n1 > n2) {
                totalInput.value = n2.toFixed(2);
                receivedInput.value = n1.toFixed(2);
            } else {
                totalInput.value = n1.toFixed(2);
                receivedInput.value = n2.toFixed(2);
            }
            performCalculation();
        } else if (numbers && numbers.length === 1) {
            const n = parseFloat(numbers[0].replace(',', '.'));
            if (!totalInput.value) {
                totalInput.value = n.toFixed(2);
            } else {
                receivedInput.value = n.toFixed(2);
                performCalculation();
            }
        } else {
            // Optional feedback if it seemed like a failed attempt
            if (text.length > 5) {
                console.warn('No se detectaron suficientes números en:', text);
            }
        }
    };

    function announceResult(text) {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        // Make the text more natural for humans
        // e.g., "5.20" -> "5 con 20" is already handled in calculation logic, 
        // but let's ensure it's clean and friendly.
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = {
            'es': 'es-ES', 'en': 'en-US', 'ca': 'ca-ES',
            'gl': 'gl-ES', 'eu': 'eu-ES', 'fr': 'fr-FR', 'va': 'ca-ES'
        };
        const targetLang = langMap[currentLang] || 'es-ES';
        utterance.lang = targetLang;

        const findBestVoice = () => {
            if (voices.length === 0) loadVoices();
            const langVoices = voices.filter(v => v.lang.includes(targetLang) || v.lang.replace('_', '-') === targetLang);

            const preferredGender = localStorage.getItem('voiceGender') || 'female';

            // Priority list for each gender
            const femaleVoices = ['Elvira', 'Helena', 'Lucia', 'Hortense', 'Marie', 'Julie', 'Neural', 'Natural', 'Google español', 'Premium'];
            const maleVoices = ['Alvaro', 'Arnav', 'Pablo', 'David', 'Paul', 'Jean', 'Neural', 'Natural', 'Google español', 'Premium'];

            const searchTerms = preferredGender === 'female' ? femaleVoices : maleVoices;

            for (const name of searchTerms) {
                const found = langVoices.find(v => {
                    const vName = v.name.toLowerCase();
                    const searchTerm = name.toLowerCase();
                    return vName.includes(searchTerm);
                });
                if (found) return found;
            }

            return langVoices.find(v => v.name.includes('Google') || v.name.includes('Microsoft')) || langVoices[0];
        };

        const voice = findBestVoice();
        if (voice) {
            utterance.voice = voice;
            console.log('Selected Voice:', voice.name);
        }

        // Slight adjustments for human-like cadence
        utterance.rate = 0.92;  // Slightly more deliberate and clear
        utterance.pitch = 1.05; // Slightly higher pitch can sound more friendly/human
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
    }

    // --- Serial API ---
    let serialPort;
    let writer;

    const connectSerialBtn = document.getElementById('connect-serial');
    if (connectSerialBtn) {
        connectSerialBtn.addEventListener('click', async () => {
            try {
                serialPort = await navigator.serial.requestPort();
                await serialPort.open({ baudRate: 9600 });
                writer = serialPort.writable.getWriter();
                console.log('Serial Connected');
                alert('Conectado a Arduino/Dispositivo');
            } catch (err) {
                console.error('Serial Error:', err);
                alert('Error al conectar dispositivo serial.');
            }
        });
    }

    async function sendSerialData(data) {
        if (writer) {
            const encoder = new TextEncoder();
            await writer.write(encoder.encode(data + '\n'));
        }
    }
});