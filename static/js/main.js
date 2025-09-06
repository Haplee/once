document.addEventListener('DOMContentLoaded', () => {

    /**
     * Handles the theme switching between light and dark mode.
     * It persists the user's preference in localStorage.
     */
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        // Apply saved theme on load
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            if (currentTheme === 'dark-mode') {
                themeToggleButton.checked = true;
            }
        }
        // Add event listener for theme changes
        themeToggleButton.addEventListener('change', function() {
            if(this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light-mode');
            }
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

            if (isNaN(totalAmount) || isNaN(amountReceived)) {
                resultDiv.textContent = 'Por favor, introduce importes válidos.';
                return;
            }

            if (amountReceived < totalAmount) {
                resultDiv.textContent = 'El importe recibido es menor que el total a pagar.';
                return;
            }

            const change = amountReceived - totalAmount;
            const changeText = `El cambio a devolver es: ${change.toFixed(2)} €`;
            resultDiv.textContent = changeText;

            speak(changeText); // Announce the result
            saveToHistory({ total: totalAmount, received: amountReceived, change: change }); // Save to history
        });
    }

    /**
     * Initializes Speech Recognition for voice commands.
     */
    const voiceInputBtn = document.getElementById('voice-input-btn');
    if (voiceInputBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript;
                processVoiceCommand(command);
            };

            voiceInputBtn.addEventListener('click', () => recognition.start());

        } else {
            // Hide button if Speech Recognition is not supported
            voiceInputBtn.style.display = 'none';
        }
    }

    /**
     * Processes the transcribed voice command to fill form fields using more natural language.

     * @param {string} command - The voice command transcribed by the SpeechRecognition API.
     */
    function processVoiceCommand(command) {
        const totalAmountInput = document.getElementById('total-amount');
        const amountReceivedInput = document.getElementById('amount-received');
        const commandLower = command.toLowerCase();

        const totalKeywords = ['total', 'cuenta', 'pagar', 'es'];
        const receivedKeywords = ['recibido', 'entregado', 'paga con', 'me da'];

        // Regular expression to find numbers (including decimals with comma or dot)
        const numberRegex = /(\d+([,.]\d+)?)/;

        // Function to find a keyword and extract the next number
        const extractNumberAfterKeyword = (keywords) => {
            for (const keyword of keywords) {
                const keywordIndex = commandLower.indexOf(keyword);
                if (keywordIndex !== -1) {
                    const restOfString = commandLower.substring(keywordIndex + keyword.length);
                    const match = restOfString.match(numberRegex);
                    if (match && match[0]) {
                        return parseFloat(match[0].replace(',', '.'));
                    }
                }
            }
            return null;
        };

        const totalValue = extractNumberAfterKeyword(totalKeywords);
        if (totalValue !== null) {
            totalAmountInput.value = totalValue;
        }

        const receivedValue = extractNumberAfterKeyword(receivedKeywords);
        if (receivedValue !== null) {
            amountReceivedInput.value = receivedValue;
        }
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
