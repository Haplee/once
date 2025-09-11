document.addEventListener('DOMContentLoaded', () => {

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

            // Clear previous result and show spinner
            resultDiv.textContent = '';
            resultSpinner.classList.remove('d-none');

            // --- Basic Validation ---
            if (isNaN(totalAmount) || isNaN(amountReceived)) {
                resultDiv.textContent = 'Por favor, introduce importes válidos.';
                resultSpinner.classList.add('d-none'); // Hide spinner
                return;
            }

            if (amountReceived < totalAmount) {
                resultDiv.textContent = 'El importe recibido es menor que el total a pagar.';
                resultSpinner.classList.add('d-none'); // Hide spinner
                return;
            }

            const change = amountReceived - totalAmount;

            // --- Simulate a short delay for showing the spinner ---
            setTimeout(() => {
                // Hide spinner
                resultSpinner.classList.add('d-none');

                // Format for display
                const changeTextForDisplay = `El cambio a devolver es: ${change.toFixed(2)} €`;
                resultDiv.textContent = changeTextForDisplay;

                // Format for speech using the new helper function
                const speakableChange = formatChangeForSpeech(change);
                const changeTextForSpeech = `El cambio a devolver es: ${speakableChange}`;
                speak(changeTextForSpeech); // Announce the result

                saveToHistory({ total: totalAmount, received: amountReceived, change: change }); // Save to history
            }, 500); // 0.5 second delay
        });
    }

    /**
     * Handles the voice input button click, checking for compatibility first.
     */
    const voiceInputBtn = document.getElementById('voice-input-btn');
    if (voiceInputBtn) {
        const voiceMessageContainer = document.getElementById('voice-message-container');
        const voiceSpinner = document.getElementById('voice-spinner');

        voiceInputBtn.addEventListener('click', () => {
            // Reset message container and hide spinner on new attempt
            if (voiceMessageContainer) {
                voiceMessageContainer.style.display = 'none';
                voiceMessageContainer.textContent = ''; // Clear previous messages
            }
            voiceSpinner.classList.add('d-none');

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                // --- API is supported, proceed with recognition ---
                const recognition = new SpeechRecognition();
                recognition.lang = 'es-ES';
                recognition.interimResults = false;
                let recognitionTimeout;

                const stopRecognition = () => {
                    clearTimeout(recognitionTimeout);
                    voiceSpinner.classList.add('d-none');
                };

                recognition.onresult = (event) => {
                    stopRecognition();
                    const command = event.results[event.results.length - 1][0].transcript;
                    processVoiceCommand(command);
                };

                recognition.onerror = (event) => {
                    stopRecognition();
                    let errorMessage = '';
                    if (event.error === 'not-allowed' || event.error === 'aborted') {
                        errorMessage = 'Acceso al micrófono denegado. Para usar esta función, por favor, permite el acceso al micrófono en tu navegador.';
                    } else if (event.error === 'no-speech') {
                        errorMessage = 'No se ha detectado ninguna voz. Inténtalo de nuevo hablando cerca del micrófono.';
                    } else {
                        errorMessage = `Error de reconocimiento: ${event.error}. Por favor, inténtalo de nuevo.`;
                    }
                    if (voiceMessageContainer) {
                        voiceMessageContainer.textContent = errorMessage;
                        voiceMessageContainer.style.display = 'block';
                    }
                };

                recognition.onstart = () => {
                    // Show spinner and hide any previous messages
                    voiceSpinner.classList.remove('d-none');
                    if (voiceMessageContainer) {
                        voiceMessageContainer.style.display = 'none';
                    }
                    recognitionTimeout = setTimeout(() => {
                        recognition.stop();
                        if (voiceMessageContainer) {
                            voiceMessageContainer.textContent = "El reconocimiento de voz se detuvo por inactividad.";
                            voiceMessageContainer.style.display = 'block';
                        }
                        stopRecognition(); // Also hide spinner on timeout
                    }, 10000); // 10-second timeout for silent failures
                };

                try {
                    recognition.start();
                } catch (e) {
                    voiceSpinner.classList.add('d-none'); // Hide spinner on failure to start
                    if (voiceMessageContainer) {
                        voiceMessageContainer.textContent = "No se pudo iniciar el reconocimiento. Asegúrate de que el micrófono esté permitido y no esté en uso.";
                        voiceMessageContainer.style.display = 'block';
                    }
                }

            } else {
                // --- API is not supported, show an alert ---
                if (voiceMessageContainer) {
                    voiceMessageContainer.textContent = "Lo sentimos, tu navegador no es compatible con el reconocimiento de voz.";
                    voiceMessageContainer.style.display = 'block';
                }
            }
        });
    }

    /**
     * Processes the transcribed voice command to fill form fields using more natural language.
     * @param {string} command - The voice command transcribed by the SpeechRecognition API.
     */
    function processVoiceCommand(command) {
        const totalAmountInput = document.getElementById('total-amount');
        const amountReceivedInput = document.getElementById('amount-received');
        const commandLower = command.toLowerCase();

        // Regular expression to find all numbers (including decimals with comma or dot)
        const numberRegex = /(\d+([,.]\d+)?)/g;
        const matches = commandLower.match(numberRegex);

        if (!matches) {
            // No numbers detected in the voice command.
            return;
        }

        const numbers = matches.map(n => parseFloat(n.replace(',', '.')));

        // If two or more numbers are detected, the user's primary request is to use positional assignment.
        // First number is total, second is amount received. This overwrites existing values.
        if (numbers.length >= 2) {
            totalAmountInput.value = numbers[0];
            amountReceivedInput.value = numbers[1];
        }
        // If only one number is detected, we use keywords to determine its destination to avoid ambiguity.
        else if (numbers.length === 1) {
            const number = numbers[0];

            // Refined keyword lists to be more specific and avoid overlap.
            const totalKeywords = ['total', 'cuenta', 'cobrar', 'es']; // 'pagar' was too ambiguous
            const receivedKeywords = ['recibido', 'entregado', 'paga con', 'me da'];

            const isForTotal = totalKeywords.some(k => commandLower.includes(k));
            const isForReceived = receivedKeywords.some(k => commandLower.includes(k));

            // Assign to the field explicitly mentioned.
            if (isForTotal && !isForReceived) {
                totalAmountInput.value = number;
            } else if (isForReceived && !isForTotal) {
                amountReceivedInput.value = number;
            } else {
                // If keywords are ambiguous (e.g., none, or for both), fall back to a simple rule:
                // fill the first empty field, starting with 'total'.
                if (totalAmountInput.value === '') {
                    totalAmountInput.value = number;
                } else if (amountReceivedInput.value === '') {
                    amountReceivedInput.value = number;
                } else {
                    // If both fields are already filled, update the amount received as it's the most likely to be said last.
                    amountReceivedInput.value = number;
                }
            }
        }
    }

    /**
     * Formats the change amount into a natural-sounding Spanish string for speech.
     * @param {number} change - The amount of change.
     * @returns {string} - A natural language string (e.g., "dos euros con cincuenta céntimos").
     */
    function formatChangeForSpeech(change) {
        const euros = Math.floor(change);
        const cents = Math.round((change - euros) * 100);

        if (euros === 0 && cents === 0) {
            return 'cero euros';
        }

        let parts = [];

        if (euros === 1) {
            parts.push('un euro');
        } else if (euros > 1) {
            parts.push(`${euros} euros`);
        }

        if (cents > 0) {
            if (cents === 1) {
                parts.push('un céntimo');
            } else {
                parts.push(`${cents} céntimos`);
            }
        }

        return parts.join(' con ');
    }

    /**
     * Uses the SpeechSynthesis API to read text aloud.
     * @param {string} text - The text to be spoken.
     */
    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            window.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Saves the transaction data to the browser's localStorage.
     * @param {object} data - The transaction data.
     */
    function saveToHistory(data) {
        // Get existing history or initialize a new array
        const history = JSON.parse(localStorage.getItem('transactionHistory')) || [];

        // Add a timestamp
        data.timestamp = new Date().toLocaleString('es-ES');

        // Add the new transaction to the beginning of the array
        history.unshift(data);

        // Save back to localStorage
        localStorage.setItem('transactionHistory', JSON.stringify(history));
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
