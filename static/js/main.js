document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Management ---
    const getSavedTheme = () => localStorage.getItem('once_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);

        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton) {
            themeToggleButton.checked = theme === 'dark';
        }
    };

    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            localStorage.setItem('once_theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // Apply theme on initial load
    applyTheme(getSavedTheme());

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
     * Handles the voice input button click, using the VoiceControl module.
     */
    const voiceInputBtn = document.getElementById('voice-input-btn');
    if (voiceInputBtn) {
        const voiceMessageContainer = document.getElementById('voice-message-container');
        const voiceSpinner = document.getElementById('voice-spinner');

        // Initial setup based on availability
        if (!VoiceControl.isAvailable()) {
            voiceInputBtn.disabled = true;
            if (voiceMessageContainer) {
                voiceMessageContainer.textContent = I18N.t('reconocimiento_no_disponible');
                voiceMessageContainer.style.display = 'block';
            }
        }

        voiceInputBtn.addEventListener('click', () => {
            // Disable button and show spinner
            voiceInputBtn.disabled = true;
            voiceSpinner.classList.remove('d-none');
            if (voiceMessageContainer) {
                voiceMessageContainer.style.display = 'none';
            }

            VoiceControl.start(({ transcript, error }) => {
                // Re-enable button and hide spinner
                voiceInputBtn.disabled = false;
                voiceSpinner.classList.add('d-none');

                if (error) {
                    let errorKey;
                    switch (error) {
                        case 'not-allowed':
                        case 'aborted':
                            errorKey = 'voiceErrorPermission';
                            break;
                        case 'no-speech':
                            errorKey = 'voiceErrorNoSpeech';
                            break;
                        case 'network':
                            errorKey = 'voiceErrorNetwork'; // You may want to add this key to i18n
                            break;
                        case 'start-failed':
                            errorKey = 'voiceErrorStart';
                            break;
                        default:
                            errorKey = 'voiceErrorInfo';
                    }
                    if (voiceMessageContainer) {
                        voiceMessageContainer.textContent = I18N.t(errorKey).replace('{error}', error);
                        voiceMessageContainer.style.display = 'block';
                    }
                    return;
                }

                if (transcript) {
                    processVoiceCommand(transcript);
                }
            });
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
     * Handles language selection from the dropdown on the settings page.
     */
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        // Set initial value from localStorage
        const savedLang = I18N.getSavedLang();
        if (savedLang) {
            languageSelect.value = savedLang;
        }

        languageSelect.addEventListener('change', () => {
            const newLang = languageSelect.value;
            I18N.saveLang(newLang);
            I18N.applyToDOM();
            // Also update voice recognition language if the module is available
            if (window.VoiceControl && typeof VoiceControl.setLanguageForRecognition === 'function') {
                VoiceControl.setLanguageForRecognition(newLang);
            }
        });
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
